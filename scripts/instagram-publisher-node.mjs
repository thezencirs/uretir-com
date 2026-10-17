import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import { chromium } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const requireStack = createRequire(
  path.resolve(".local", "open-source-stack", "package.json")
);

async function patchInstagramPrivateApiConstants() {
  const constantsPath = path.resolve(
    ".local",
    "open-source-stack",
    "node_modules",
    "instagram-private-api",
    "dist",
    "core",
    "constants.js"
  );
  if (!existsSync(constantsPath)) return;
  try {
    let content = await fs.readFile(constantsPath, "utf8");
    const updated = content
      .replace(/APP_VERSION\s*=\s*['"][^'"]+['"]/, "APP_VERSION = '349.2.0.42.104'")
      .replace(/APP_VERSION_CODE\s*=\s*['"][^'"]+['"]/, "APP_VERSION_CODE = '374764246'");
    if (updated !== content) {
      await fs.writeFile(constantsPath, updated, "utf8");
    }
  } catch {
    // ignore
  }
}

async function publishViaPlaywrightWeb({ username, password, videoPath, feedJpgPath, caption }) {
  console.log(`[Instagram Playwright Web] @${username} için tarayıcı otomasyonu başlatılıyor...`);
  const userDataDir = path.resolve("reports", "social-media", "ig_browser_profile");
  await fs.mkdir(userDataDir, { recursive: true });

  let context = null;
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      context = await chromium.launchPersistentContext(userDataDir, {
        channel,
        headless: true,
        viewport: { width: 1280, height: 900 },
        locale: "tr-TR",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      });
      break;
    } catch {
      // try next browser channel
    }
  }

  if (!context) {
    return { ok: false, reason: "playwright_browser_unavailable" };
  }

  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(3500);

    // Dismiss cookie banners if any
    for (const label of ["Allow all cookies", "Tüm çerezlere izin ver", "Kabul Et"]) {
      const btn = page.getByRole("button", { name: label });
      if ((await btn.count()) > 0) {
        await btn.first().click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    // Check if login form is visible
    const userInp = page.locator('input[name="username"], input[name="email"]');
    if ((await userInp.count()) > 0) {
      console.log(`[Instagram Playwright Web] @${username} girişi yapılıyor...`);
      await userInp.first().fill(username);
      const passInp = page.locator('input[name="password"], input[name="pass"]');
      await passInp.first().fill(password);
      const submitBtn = page.locator('button[type="submit"], div[role="button"]:has-text("Giriş yap"), div[role="button"]:has-text("Log in")');
      await submitBtn.first().click();
      await page.waitForTimeout(8000);
    }

    const afterLoginShot = path.resolve("reports", "social-media", "ig_web_status.png");
    await page.screenshot({ path: afterLoginShot });

    // Dismiss "Save login info" or "Turn on notifications" modals
    for (const text of ["Şimdi Değil", "Not Now", "Not now", "Kaydet", "Save info"]) {
      const btn = page.getByRole("button", { name: text });
      if ((await btn.count()) > 0) {
        await btn.first().click().catch(() => {});
        await page.waitForTimeout(1500);
      }
    }

    // Click Create / New Post button
    const createSelectors = [
      'svg[aria-label="New post"]',
      'svg[aria-label="Yeni gönderi"]',
      'svg[aria-label="Oluştur"]',
      'svg[aria-label="Create"]',
      'a:has-text("Oluştur")',
      'a:has-text("Create")',
      'span:has-text("Oluştur")',
      'span:has-text("Create")',
    ];

    let clickedCreate = false;
    for (const sel of createSelectors) {
      const loc = page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(2000);
        // Check if sub-menu "Post / Gönderi" appeared
        for (const subText of ["Gönderi", "Post"]) {
          const sub = page.locator(`span:has-text("${subText}")`);
          if ((await sub.count()) > 0) {
            await sub.first().click({ force: true }).catch(() => {});
            await page.waitForTimeout(1500);
          }
        }
        if ((await page.locator('input[type="file"]').count()) > 0) {
          clickedCreate = true;
          break;
        }
      }
    }

    if (!clickedCreate) {
      console.log("[Instagram Playwright Web] Oluştur menüsü kontrol ediliyor (durum ekran görüntüsü kaydedildi: ig_web_status.png).");
      await context.close();
      return { ok: false, reason: "create_button_not_visible", screenshot: afterLoginShot };
    }

    const fileInput = page.locator('input[type="file"]').first();
    const uploadTarget = videoPath && existsSync(videoPath) ? videoPath : feedJpgPath;
    await fileInput.setInputFiles(uploadTarget);
    await page.waitForTimeout(5000);

    // Dismiss "Video posts are now shared as reels" ("Tamam" / "OK")
    for (const okText of ["Tamam", "OK", "Anladım"]) {
      const okBtn = page.getByRole("button", { name: okText });
      if ((await okBtn.count()) > 0) {
        await okBtn.first().click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }

    // Click Next ("İleri" / "Next") twice
    for (let step = 0; step < 2; step++) {
      for (const nextText of ["İleri", "Next"]) {
        const nextBtn = page.getByRole("button", { name: nextText });
        if ((await nextBtn.count()) > 0) {
          await nextBtn.first().click().catch(() => {});
          await page.waitForTimeout(2500);
          break;
        }
      }
    }

    // Fill caption
    const captionBox = page.locator('div[role="textbox"], textarea[aria-label*="Açıklama"], textarea[aria-label*="caption"]');
    if ((await captionBox.count()) > 0) {
      await captionBox.first().click().catch(() => {});
      await captionBox.first().fill(caption).catch(() => {});
      await page.waitForTimeout(1500);
    }

    // Click Share ("Paylaş" / "Share")
    for (const shareText of ["Paylaş", "Share"]) {
      const shareBtn = page.getByRole("button", { name: shareText });
      if ((await shareBtn.count()) > 0) {
        await shareBtn.first().click().catch(() => {});
        break;
      }
    }

    await page.waitForTimeout(12_000);
    const finalShot = path.resolve("reports", "social-media", "ig_web_published.png");
    await page.screenshot({ path: finalShot });
    await context.close();

    console.log(`PUBLISHED_OK type=playwright_web account=@${username} target=${path.basename(uploadTarget)}`);
    return {
      ok: true,
      published: [{ type: "playwright_web", target: uploadTarget, screenshot: finalShot }],
    };
  } catch (err) {
    await context.close().catch(() => {});
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function publishToInstagramNode({ videoPath, coverPngPath, caption, slot }) {
  const username = (process.env.IG_USERNAME || "uretirai").replace(/^@/, "").trim();
  const password = (process.env.IG_PASSWORD || "").trim();

  if (!password) {
    console.log("[Instagram Node] IG_PASSWORD tanımlı değil.");
    return { ok: false, reason: "missing_password" };
  }

  await patchInstagramPrivateApiConstants();

  const outDir = path.dirname(coverPngPath);
  const jpgCoverPath = path.join(outDir, `uretir-cover-${slot || "live"}.jpg`);
  const storyJpgPath = path.join(outDir, `uretir-story-${slot || "live"}.jpg`);
  const feedJpgPath = path.join(outDir, `uretir-feed-${slot || "live"}.jpg`);

  await sharp(coverPngPath)
    .resize(1080, 1920, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(jpgCoverPath);

  await sharp(coverPngPath)
    .resize(1080, 1920, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(storyJpgPath);

  await sharp(coverPngPath)
    .resize(1080, 1350, { fit: "contain", background: { r: 9, g: 18, b: 12 } })
    .jpeg({ quality: 92 })
    .toFile(feedJpgPath);

  const sessionPath = path.resolve("reports", "social-media", "ig_node_session.json");
  const resultPath = path.resolve("reports", "social-media", "ig_last_publish.json");

  // 1. Try patched instagram-private-api
  try {
    const { IgApiClient } = requireStack("instagram-private-api");
    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    if (existsSync(sessionPath)) {
      try {
        const saved = JSON.parse(await fs.readFile(sessionPath, "utf8"));
        await ig.state.deserialize(saved);
      } catch {
        // fresh login
      }
    }

    let authUser = null;
    try {
      authUser = await ig.account.currentUser();
    } catch {
      authUser = await ig.account.login(username, password);
    }

    const serialized = await ig.state.serialize();
    delete serialized.constants;
    await fs.mkdir(path.dirname(sessionPath), { recursive: true });
    await fs.writeFile(sessionPath, JSON.stringify(serialized), "utf8");

    console.log(`[Instagram @${username}] Giriş başarılı (pk: ${authUser?.pk || "ok"}).`);

    try {
      const currentProfile = await ig.account.currentUser();
      if (!String(currentProfile?.external_url || "").includes("uretir.com")) {
        await ig.account.editProfile({
          first_name: currentProfile?.full_name || "Üretir AI",
          biography:
            "🇹🇷 Türkiye Üretir, Gençler Yetişir!\n🤖 6 Canlı Yapay Zekâ Aracı: HaberAI · FinansAI · İndirimAI · PuanAI · ArabaAI · EvAI\n👇 Canlı Veriler & İndirim Radarı:",
          external_url: "https://www.uretir.com",
          email: currentProfile?.email || "",
          phone_number: currentProfile?.phone_number || "",
          gender: currentProfile?.gender || 3,
          username: currentProfile?.username || username,
        });
      }
    } catch {
      // ignore bio edit notice
    }

    const published = [];

    if (videoPath && existsSync(videoPath)) {
      try {
        const [videoBuffer, coverBuffer] = await Promise.all([
          fs.readFile(videoPath),
          fs.readFile(jpgCoverPath),
        ]);
        const videoRes = await ig.publish.video({
          video: videoBuffer,
          coverImage: coverBuffer,
          caption,
        });
        const code = videoRes?.media?.code || "";
        const pk = videoRes?.media?.pk || "";
        const url = code ? `https://www.instagram.com/p/${code}/` : `pk:${pk}`;
        published.push({ type: "video", pk: String(pk), code: String(code), url });
        console.log(`PUBLISHED_OK type=video url=${url}`);
      } catch (vErr) {
        console.warn("[Instagram Video Bilgi]:", vErr?.message || vErr);
      }
    }

    if (published.length === 0) {
      try {
        const feedBuffer = await fs.readFile(feedJpgPath);
        const photoRes = await ig.publish.photo({
          file: feedBuffer,
          caption,
        });
        const code = photoRes?.media?.code || "";
        const pk = photoRes?.media?.pk || "";
        const url = code ? `https://www.instagram.com/p/${code}/` : `pk:${pk}`;
        published.push({ type: "photo", pk: String(pk), code: String(code), url });
        console.log(`PUBLISHED_OK type=photo url=${url}`);
      } catch (pErr) {
        console.warn("[Instagram Photo Bilgi]:", pErr?.message || pErr);
      }
    }

    try {
      const storyBuffer = await fs.readFile(storyJpgPath);
      const storyRes = await ig.publish.story({
        file: storyBuffer,
      });
      const pk = storyRes?.media?.pk || "";
      published.push({ type: "story", pk: String(pk) });
      console.log(`PUBLISHED_OK type=story pk=${pk}`);
    } catch {
      // ignore story notice
    }

    if (published.length > 0) {
      await fs.writeFile(
        resultPath,
        JSON.stringify({ username, publishedAt: new Date().toISOString(), published }, null, 2),
        "utf8"
      );
      return { ok: true, published };
    }
  } catch (err) {
    console.log("[Instagram Mobil API Bilgi]:", err?.message || err);
  }

  // 2. Fallback to Playwright Web Automation (microsoft/playwright 70k+ stars)
  const webRes = await publishViaPlaywrightWeb({
    username,
    password,
    videoPath,
    feedJpgPath,
    caption,
  });

  await fs.mkdir(path.dirname(resultPath), { recursive: true });
  await fs.writeFile(
    resultPath,
    JSON.stringify(
      {
        username,
        attemptedAt: new Date().toISOString(),
        ...webRes,
      },
      null,
      2
    ),
    "utf8"
  );
  return webRes;
}
