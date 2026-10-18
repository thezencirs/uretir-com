import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const execFileAsync = promisify(execFile);
const requireStack = createRequire(
  path.resolve(".local", "open-source-stack", "package.json")
);

async function main() {
  const username = (process.env.IG_USERNAME || "uretirai").replace(/^@/, "").trim();
  const password = (process.env.IG_PASSWORD || "C@n48mugla").trim();

  const { chromium } = requireStack("playwright");
  const userDataDir = path.resolve("reports", "social-media", "ig_browser_profile");
  await fs.mkdir(userDataDir, { recursive: true });

  console.log(`[Instagram Canlı Bağlantı] @${username} için görünür tarayıcı penceresi açılıyor...`);

  let context = null;
  for (const channel of ["msedge", "chrome", undefined]) {
    try {
      context = await chromium.launchPersistentContext(userDataDir, {
        channel,
        headless: false,
        args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
        ignoreDefaultArgs: ["--enable-automation"],
        viewport: null,
        locale: "tr-TR",
      });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });
      break;
    } catch {
      // try next channel
    }
  }

  if (!context) {
    console.error("Tarayıcı başlatılamadı.");
    process.exit(1);
  }

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForTimeout(3500);

  // Auto-fill username and password if login form is visible
  try {
    const userInp = page.locator('input[name="username"], input[name="email"]');
    if ((await userInp.count()) > 0) {
      await userInp.first().click();
      await userInp.first().fill(username);
      const passInp = page.locator('input[name="password"], input[name="pass"]');
      await passInp.first().click();
      await passInp.first().fill(password);
      const submitBtn = page.locator(
        'button[type="submit"], div[role="button"]:has-text("Giriş yap"), div[role="button"]:has-text("Log in")'
      );
      if ((await submitBtn.count()) > 0) {
        await submitBtn.first().click().catch(() => {});
      }
    }
  } catch {
    // ignore auto-fill errors, user can interact directly
  }

  console.log("Tarayıcıda giriş tamamlanana kadar bekleniyor (sessionid çerezi algılanacak)...");
  let capturedSessionId = "";

  for (let i = 0; i < 90; i++) {
    try {
      const cookies = await context.cookies("https://www.instagram.com");
      const sid = cookies.find((c) => c.name === "sessionid" && c.value && c.value.length > 15);
      if (sid) {
        capturedSessionId = decodeURIComponent(sid.value);
        console.log(`✅ [Instagram @${username}] Oturum anahtarı (sessionid) başarıyla yakalandı!`);
        break;
      }
    } catch {
      // ignore if window closed
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (capturedSessionId) {
    const sidPath = path.resolve("reports", "social-media", "ig_sessionid.txt");
    await fs.writeFile(sidPath, capturedSessionId, "utf8");
    await page.waitForTimeout(2000).catch(() => {});
    await context.close().catch(() => {});

    console.log("🚀 Yakalanan oturum ile @uretirai Reels ve Hikaye paylaşımı başlatılıyor...");
    const { stdout, stderr } = await execFileAsync(
      "node",
      ["scripts/social-video-automation.mjs", "--slot=12"],
      { timeout: 240_000 }
    );
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } else {
    await context.close().catch(() => {});
    console.log("Zaman aşımı: Oturum anahtarı henüz yakalanamadı.");
  }
}

main().catch((err) => {
  console.error("Interactive login error:", err);
  process.exit(1);
});
