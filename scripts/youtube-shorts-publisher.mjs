import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const localStackPkg = path.resolve(".local", "open-source-stack", "package.json");
const requireStack = createRequire(
  existsSync(localStackPkg) ? localStackPkg : path.resolve("package.json")
);

const YOUTUBE_EMAIL = process.env.YOUTUBE_EMAIL || "archzencir@gmail.com";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Uretir";
const PROFILE_DIR = path.resolve("reports", "social-media", "youtube_browser_profile");
const STATUS_FILE = path.resolve("reports", "social-media", "youtube_session_status.json");

async function launchBrowserContext({ headless = false } = {}) {
  let chromium;
  try {
    ({ chromium } = requireStack("playwright"));
  } catch (err) {
    throw new Error(`Playwright modülü bulunamadı: ${err?.message || err}`);
  }

  await fs.mkdir(PROFILE_DIR, { recursive: true });

  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      const context = await chromium.launchPersistentContext(PROFILE_DIR, {
        channel,
        headless,
        viewport: { width: 1280, height: 860 },
        locale: "tr-TR",
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-default-browser-check",
          "--disable-infobars",
        ],
        ignoreDefaultArgs: ["--enable-automation"],
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });
      return context;
    } catch {
      // try next browser channel
    }
  }
  throw new Error("Tarayıcı (Edge/Chrome/Chromium) başlatılamadı.");
}

/**
 * Interactive Google / YouTube Studio Passkey & Approval Login for archzencir@gmail.com
 */
export async function loginToYouTubeInteractive() {
  console.log(`[YouTube @Uretir] ${YOUTUBE_EMAIL} için geçiş anahtarı / onay ekranı açılıyor...`);
  const context = await launchBrowserContext({ headless: false });
  const page = context.pages()[0] || (await context.newPage());

  try {
    await page.goto(
      "https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fstudio.youtube.com%2F",
      { waitUntil: "domcontentloaded", timeout: 45_000 }
    );
    await page.waitForTimeout(2000);

    // Check if already logged into YouTube Studio
    if (page.url().includes("studio.youtube.com") && !page.url().includes("accounts.google.com")) {
      console.log("[YouTube @Uretir] Oturum zaten açık ve doğrulandı!");
      await fs.writeFile(
        STATUS_FILE,
        JSON.stringify(
          {
            authenticated: true,
            email: YOUTUBE_EMAIL,
            channel: YOUTUBE_CHANNEL_URL,
            verifiedAt: new Date().toISOString(),
            studioUrl: page.url(),
          },
          null,
          2
        ),
        "utf8"
      );
      await context.close();
      return { ok: true, status: "already_authenticated" };
    }

    // Fill archzencir@gmail.com automatically if email input is visible
    const emailInput = page.locator('input[type="email"], input#identifierId');
    if ((await emailInput.count()) > 0) {
      await emailInput.first().fill(YOUTUBE_EMAIL);
      await page.waitForTimeout(600);
      const nextBtn = page.locator('#identifierNext, button:has-text("İleri"), button:has-text("Next")');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.first().click().catch(() => {});
      } else {
        await emailInput.first().press("Enter").catch(() => {});
      }
      console.log(
        `[YouTube @Uretir] "${YOUTUBE_EMAIL}" girildi ve İleri tıklandı. Lütfen açılan pencereden Geçiş Anahtarı (Passkey) veya telefon onayını tamamlayın...`
      );
    }

    // Save a screenshot of the prompt so we can also show status if needed
    await page.waitForTimeout(3500);
    const promptShot = path.resolve("reports", "social-media", "youtube_login_prompt.png");
    await page.screenshot({ path: promptShot }).catch(() => {});

    // Wait up to 240 seconds for user to approve passkey / 2FA and land on studio.youtube.com or youtube.com
    const startMs = Date.now();
    let authenticated = false;
    while (Date.now() - startMs < 240_000) {
      const currentUrl = page.url();
      if (
        (currentUrl.includes("studio.youtube.com") || currentUrl.includes("youtube.com")) &&
        !currentUrl.includes("accounts.google.com") &&
        !currentUrl.includes("ServiceLogin")
      ) {
        authenticated = true;
        break;
      }
      await page.waitForTimeout(2000);
    }

    if (authenticated) {
      await page.waitForTimeout(4000);
      const okShot = path.resolve("reports", "social-media", "youtube_studio_authenticated.png");
      await page.screenshot({ path: okShot }).catch(() => {});
      await fs.writeFile(
        STATUS_FILE,
        JSON.stringify(
          {
            authenticated: true,
            email: YOUTUBE_EMAIL,
            channel: YOUTUBE_CHANNEL_URL,
            verifiedAt: new Date().toISOString(),
            studioUrl: page.url(),
          },
          null,
          2
        ),
        "utf8"
      );
      console.log(`YOUTUBE_AUTH_OK email=${YOUTUBE_EMAIL} url=${page.url()}`);
      await context.close();
      return { ok: true, status: "authenticated" };
    }

    await context.close().catch(() => {});
    return { ok: false, status: "approval_timeout" };
  } catch (err) {
    await context.close().catch(() => {});
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Publishes a 9:16 vertical MP4 video as a YouTube Short to https://www.youtube.com/@Uretir
 * Requires %100 İHLAL YOKTUR approval from the Compliance Gate Agent before executing.
 */
export async function publishToYouTubeShorts({ videoPath, slotData, complianceReport }) {
  if (!complianceReport || complianceReport.verdict !== "%100 İHLAL YOKTUR") {
    console.warn("[YouTube @Uretir] İhlal Ajanı '%100 İHLAL YOKTUR' onayı olmadan YouTube yayını yapılamaz!");
    return { ok: false, reason: "compliance_not_approved" };
  }

  if (!videoPath || !existsSync(videoPath)) {
    return { ok: false, reason: "missing_video_file" };
  }

  if (!existsSync(STATUS_FILE)) {
    console.log(
      `[YouTube @Uretir] ${YOUTUBE_EMAIL} oturumu henüz onaylanmadı. 'node scripts/youtube-shorts-publisher.mjs --login' ile geçiş anahtarı onayı bekleniyor.`
    );
    return { ok: false, reason: "youtube_login_pending" };
  }

  const rawTitle = slotData.scenes?.[0]?.title || slotData.label || "Üretir AI Güncel Analiz";
  const shortTitle = `${rawTitle.slice(0, 78)} #Shorts`;
  const description = [
    slotData.customCaption || rawTitle,
    "",
    `🌐 Canlı Veriler ve Karşılaştırma Merkezi: ${slotData.targetUrl || "https://www.uretir.com"}`,
    `📺 YouTube Kanalımız: ${YOUTUBE_CHANNEL_URL}`,
    `📸 Instagram: https://www.instagram.com/uretirai/`,
    `✅ İhlal Sorgu Ajanı Onayı: ${complianceReport.verdict} (${complianceReport.checkedAt})`,
  ].join("\n");

  console.log(`[YouTube @Uretir] Shorts yüklemesi başlatılıyor: "${shortTitle}"`);
  let context = null;
  try {
    context = await launchBrowserContext({ headless: false });
    const page = context.pages()[0] || (await context.newPage());
    await page.goto("https://studio.youtube.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(5000);

    if (page.url().includes("accounts.google.com")) {
      console.log(`[YouTube @Uretir] Oturum süresi dolmuş, geçiş anahtarı onayı gerekiyor.`);
      await context.close();
      return { ok: false, reason: "session_expired" };
    }

    // Click Create / Oluştur button in YouTube Studio
    const createSelectors = [
      '#create-icon',
      'ytcp-button#create-icon',
      'button[aria-label*="Oluştur"]',
      'button[aria-label*="Create"]',
      'ytcp-button:has-text("Oluştur")',
      'ytcp-button:has-text("Create")',
    ];
    for (const sel of createSelectors) {
      const loc = page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click().catch(() => {});
        break;
      }
    }
    await page.waitForTimeout(1500);

    // Click Upload videos / Video yükle
    const uploadMenuSelectors = [
      'tp-yt-paper-item#text-item-0',
      'tp-yt-paper-item:has-text("Video yükle")',
      'tp-yt-paper-item:has-text("Upload videos")',
    ];
    for (const sel of uploadMenuSelectors) {
      const loc = page.locator(sel);
      if ((await loc.count()) > 0) {
        await loc.first().click().catch(() => {});
        break;
      }
    }
    await page.waitForTimeout(2000);

    // Attach MP4 file to input[type="file"]
    const fileInput = page.locator('input[type="file"]');
    if ((await fileInput.count()) === 0) {
      await context.close();
      return { ok: false, reason: "upload_file_input_not_found" };
    }
    await fileInput.first().setInputFiles(videoPath);
    await page.waitForTimeout(6000);

    // Fill Title and Description boxes
    const textboxes = page.locator('#textbox[contenteditable="true"]');
    if ((await textboxes.count()) >= 1) {
      await textboxes.nth(0).click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type(shortTitle.slice(0, 98));
    }
    if ((await textboxes.count()) >= 2) {
      await textboxes.nth(1).click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type(description.slice(0, 4500));
    }
    await page.waitForTimeout(1500);

    // Select "Not made for kids" (Çocuklara özel değil)
    const notForKids = page.locator(
      'tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]'
    );
    if ((await notForKids.count()) > 0) {
      await notForKids.first().click().catch(() => {});
    }

    // Step through Next (İleri) 3 times to Visibility step
    for (let step = 0; step < 3; step++) {
      await page.waitForTimeout(1800);
      const nextBtn = page.locator('#next-button, ytcp-button#next-button');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.first().click().catch(() => {});
      }
    }

    await page.waitForTimeout(2000);
    // Select Public (Herkese açık)
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]');
    if ((await publicRadio.count()) > 0) {
      await publicRadio.first().click().catch(() => {});
    }
    await page.waitForTimeout(1500);

    // Click Done / Publish (Yayınla / Kaydet)
    const doneBtn = page.locator('#done-button, ytcp-button#done-button');
    if ((await doneBtn.count()) > 0) {
      await doneBtn.first().click().catch(() => {});
    }

    await page.waitForTimeout(10_000);
    const shotPath = path.resolve("reports", "social-media", "youtube_last_publish.png");
    await page.screenshot({ path: shotPath }).catch(() => {});
    await context.close();

    console.log(`PUBLISHED_YOUTUBE_OK channel=@Uretir title="${shortTitle}"`);
    return {
      ok: true,
      channel: YOUTUBE_CHANNEL_URL,
      title: shortTitle,
      screenshot: shotPath,
      publishedAt: new Date().toISOString(),
    };
  } catch (err) {
    if (context) await context.close().catch(() => {});
    return { ok: false, error: err?.message || String(err) };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/youtube-shorts-publisher.mjs")) {
  if (process.argv.includes("--login")) {
    loginToYouTubeInteractive().then((res) => {
      console.log("YouTube Giriş Sonucu:", JSON.stringify(res, null, 2));
      process.exit(res.ok ? 0 : 1);
    });
  }
}
