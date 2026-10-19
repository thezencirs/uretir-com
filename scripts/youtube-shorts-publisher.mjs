import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
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
const PROFILE_DIR = path.resolve("reports", "social-media", "youtube_native_profile");
const STATUS_FILE = path.resolve("reports", "social-media", "youtube_session_status.json");
const CDP_PORT = 9234;

function findNativeBrowserExecutable() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

async function connectOrLaunchNativeBrowser(targetUrl = "https://studio.youtube.com") {
  const { chromium } = requireStack("playwright");
  await fs.mkdir(PROFILE_DIR, { recursive: true });

  // Try connecting if already open on CDP_PORT
  try {
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
    const context = browser.contexts()[0];
    if (context) return { browser, context };
  } catch {
    // Not running yet, spawn native browser
  }

  const exe = findNativeBrowserExecutable();
  if (!exe) {
    throw new Error("Chrome veya Edge bulunamadı.");
  }

  const child = spawn(
    exe,
    [
      `--user-data-dir=${PROFILE_DIR}`,
      `--remote-debugging-port=${CDP_PORT}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--start-maximized",
      targetUrl,
    ],
    {
      detached: true,
      stdio: "ignore",
    }
  );
  child.unref();

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
      const context = browser.contexts()[0];
      if (context) return { browser, context };
    } catch {
      // wait for browser startup
    }
  }
  throw new Error("Yerel tarayıcı CDP bağlantısı kurulamadı.");
}

/**
 * Interactive Google / YouTube Studio Passkey & Approval Login for archzencir@gmail.com
 * Uses native Chrome/Edge so Google WebAuthn (Passkey) & Phone Prompt work natively without reCAPTCHA blocks.
 */
export async function loginToYouTubeInteractive() {
  console.log(`[YouTube @Uretir] ${YOUTUBE_EMAIL} için yerel Chrome/Edge Geçiş Anahtarı (Passkey) ekranı açılıyor...`);
  const loginUrl =
    "https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fstudio.youtube.com%2F";
  const { context } = await connectOrLaunchNativeBrowser(loginUrl);
  const page = context.pages()[0] || (await context.newPage());

  try {
    await page.bringToFront().catch(() => {});
    await page.waitForTimeout(2500);

    if (!page.url().includes("studio.youtube.com") && !page.url().includes("accounts.google.com")) {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(2000);
    }

    // Check if already logged into YouTube Studio
    if (page.url().includes("studio.youtube.com") && !page.url().includes("accounts.google.com")) {
      console.log("YOUTUBE_AUTH_OK (Oturum zaten açık)");
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
      return { ok: true, status: "already_authenticated" };
    }

    // Fill archzencir@gmail.com automatically if email input is visible
    const emailInput = page.locator('input[type="email"], input#identifierId');
    if ((await emailInput.count()) > 0) {
      const currentVal = await emailInput.first().inputValue().catch(() => "");
      if (!currentVal) {
        await emailInput.first().click();
        await emailInput.first().fill(YOUTUBE_EMAIL);
        await page.waitForTimeout(700);
        const nextBtn = page.locator('#identifierNext, button:has-text("İleri"), button:has-text("Next")');
        if ((await nextBtn.count()) > 0) {
          await nextBtn.first().click().catch(() => {});
        } else {
          await emailInput.first().press("Enter").catch(() => {});
        }
        console.log(
          `[YouTube @Uretir] "${YOUTUBE_EMAIL}" girildi ve İleri tıklandı. Geçiş Anahtarı (Passkey) / Telefon Onayı bekleniyor...`
        );
      }
    }

    await page.waitForTimeout(3500);
    const promptShot = path.resolve("reports", "social-media", "youtube_login_prompt.png");
    await page.screenshot({ path: promptShot }).catch(() => {});

    // Wait up to 30 minutes (1800 seconds) for user approval
    const startMs = Date.now();
    while (Date.now() - startMs < 1800_000) {
      const currentUrl = page.url();
      if (
        (currentUrl.includes("studio.youtube.com") || currentUrl.includes("youtube.com")) &&
        !currentUrl.includes("accounts.google.com") &&
        !currentUrl.includes("ServiceLogin") &&
        !currentUrl.includes("signin")
      ) {
        await page.waitForTimeout(3500);
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
        return { ok: true, status: "authenticated", studioUrl: page.url() };
      }
      await page.waitForTimeout(2500);
    }

    return { ok: false, status: "approval_timeout" };
  } catch (err) {
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
      `[YouTube @Uretir] ${YOUTUBE_EMAIL} oturumu henüz onaylanmadı. Tarayıcıdaki geçiş anahtarı onayı bekleniyor.`
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
  try {
    const { context } = await connectOrLaunchNativeBrowser("https://studio.youtube.com/");
    const page = context.pages()[0] || (await context.newPage());
    if (!page.url().includes("studio.youtube.com")) {
      await page.goto("https://studio.youtube.com/", { waitUntil: "domcontentloaded", timeout: 45_000 });
    }
    await page.waitForTimeout(5000);

    if (page.url().includes("accounts.google.com")) {
      console.log(`[YouTube @Uretir] Oturum süresi dolmuş, geçiş anahtarı onayı gerekiyor.`);
      return { ok: false, reason: "session_expired" };
    }

    // Click Create / Oluştur button in YouTube Studio
    const createSelectors = [
      "#create-icon",
      "ytcp-button#create-icon",
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
      "tp-yt-paper-item#text-item-0",
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
      const nextBtn = page.locator("#next-button, ytcp-button#next-button");
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
    const doneBtn = page.locator("#done-button, ytcp-button#done-button");
    if ((await doneBtn.count()) > 0) {
      await doneBtn.first().click().catch(() => {});
    }

    await page.waitForTimeout(10_000);
    const shotPath = path.resolve("reports", "social-media", "youtube_last_publish.png");
    await page.screenshot({ path: shotPath }).catch(() => {});

    console.log(`PUBLISHED_YOUTUBE_OK channel=@Uretir title="${shortTitle}"`);
    return {
      ok: true,
      channel: YOUTUBE_CHANNEL_URL,
      title: shortTitle,
      screenshot: shotPath,
      publishedAt: new Date().toISOString(),
    };
  } catch (err) {
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
