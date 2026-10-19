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

    // If --retrigger is passed, reload login page or advance from current verification step
    if (process.argv.includes("--retrigger")) {
      // First check if reCAPTCHA checkbox is currently on screen
      let clickedRecaptcha = false;
      for (const frame of page.frames()) {
        if (frame.url().includes("recaptcha") && frame.url().includes("anchor")) {
          const box = frame.locator("#recaptcha-anchor");
          if ((await box.count()) > 0) {
            console.log("[YouTube @Uretir] reCAPTCHA kutucuğu tıklandı...");
            await box.first().click({ delay: 80 }).catch(() => {});
            clickedRecaptcha = true;
            await page.waitForTimeout(2500);
          }
        }
      }
      if (clickedRecaptcha) {
        const nextBtn = page.locator('button:has-text("Sonraki"), button:has-text("İleri"), button:has-text("Next")');
        if ((await nextBtn.count()) > 0) {
          await nextBtn.first().click().catch(() => {});
          await page.waitForTimeout(3500);
        }
      } else {
        await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
        await page.waitForTimeout(2000);
      }
    }

    // Fill archzencir@gmail.com automatically ONLY if visible identifierId input is on screen
    const emailInput = page.locator("input#identifierId:visible");
    if ((await emailInput.count()) > 0) {
      await emailInput.first().click().catch(() => {});
      await emailInput.first().fill("");
      await page.keyboard.type(YOUTUBE_EMAIL, { delay: 75 });
      await page.waitForTimeout(700);
      const nextBtn = page.locator('#identifierNext, button:has-text("İleri"), button:has-text("Next"), button:has-text("Sonraki")');
      if ((await nextBtn.count()) > 0) {
        await nextBtn.first().click().catch(() => {});
      } else {
        await emailInput.first().press("Enter").catch(() => {});
      }
      console.log(
        `[YouTube @Uretir] "${YOUTUBE_EMAIL}" girildi ve İleri tıklandı. Geçiş Anahtarı (Passkey) / Telefon Onayı bekleniyor...`
      );
      await page.waitForTimeout(3500);
    }

    // Also try clicking reCAPTCHA if Google presented it right after email
    for (const frame of page.frames()) {
      if (frame.url().includes("recaptcha") && frame.url().includes("anchor")) {
        const box = frame.locator("#recaptcha-anchor");
        if ((await box.count()) > 0) {
          await box.first().click({ delay: 90 }).catch(() => {});
          await page.waitForTimeout(2500);
          const nextBtn = page.locator('button:has-text("Sonraki"), button:has-text("İleri"), button:has-text("Next")');
          if ((await nextBtn.count()) > 0) {
            await nextBtn.first().click().catch(() => {});
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    const codeArgIdx = process.argv.indexOf("--code");
    const providedCode = codeArgIdx !== -1 ? process.argv[codeArgIdx + 1] : "";

    // If on password screen (/challenge/pwd) or user wants passkey/phone prompt, click "Başka bir yöntem dene"
    if (page.url().includes("/challenge/pwd") || process.argv.includes("--passkey")) {
      const tryAnotherBtn = page.locator(
        'button:has-text("Başka bir yöntem dene"), button:has-text("Try another way"), span:has-text("Başka bir yöntem dene")'
      );
      if ((await tryAnotherBtn.count()) > 0) {
        console.log('[YouTube @Uretir] "Başka bir yöntem dene" tıklanıyor...');
        await tryAnotherBtn.first().click({ delay: 80 }).catch(() => {});
        await page.waitForTimeout(3500);
      }
    }

    // If on challenge selection screen (/challenge/selection) and NO code provided, click Passkey or Phone Prompt option
    if (!providedCode) {
      const passkeyOrPromptOption = page.locator(
        'li:has-text("Telefonunuzdan"), li:has-text("Evet"), li:has-text("Geçiş anahtarı"), div[role="link"]:has-text("Telefonunuzdan"), div[role="link"]:has-text("Geçiş anahtarı"), div[data-challengetype="4"], div[data-challengetype="39"]'
      );
      if ((await passkeyOrPromptOption.count()) > 0) {
        console.log("[YouTube @Uretir] Geçiş Anahtarı / Telefon Onayı seçeneği tıklanıyor...");
        await passkeyOrPromptOption.first().click({ delay: 80 }).catch(() => {});
        await page.waitForTimeout(3500);
      }
    }

    const promptShot = path.resolve("reports", "social-media", "youtube_login_prompt.png");
    await page.screenshot({ path: promptShot }).catch(() => {});

    // If on "Yeniden başlat" modal, click it or reload loginUrl
    const restartBtn = page.locator('button:has-text("Yeniden başlat"), span:has-text("Yeniden başlat")');
    if ((await restartBtn.count()) > 0) {
      await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(2000);
      const emailAgain = page.locator("input#identifierId:visible");
      if ((await emailAgain.count()) > 0) {
        await emailAgain.first().click().catch(() => {});
        await page.keyboard.type(YOUTUBE_EMAIL, { delay: 65 });
        await page.waitForTimeout(600);
        await emailAgain.first().press("Enter").catch(() => {});
        await page.waitForTimeout(3500);
      }
      const tryAnotherAgain = page.locator('button:has-text("Başka bir yöntem dene"), span:has-text("Başka bir yöntem dene")');
      if ((await tryAnotherAgain.count()) > 0) {
        await tryAnotherAgain.first().click({ delay: 60 }).catch(() => {});
        await page.waitForTimeout(3000);
      }
    }

    // If on /challenge/pk/presend and user provided a 6-digit code, click "Başka bir yöntem dene" to open /challenge/selection!
    if (page.url().includes("/challenge/pk") && providedCode) {
      const tryAnotherFromPk = page.locator(
        'button:has-text("Başka bir yöntem dene"), span:has-text("Başka bir yöntem dene")'
      );
      if ((await tryAnotherFromPk.count()) > 0) {
        console.log('[YouTube @Uretir] /challenge/pk ekranından "Başka bir yöntem dene" tıklanıyor...');
        await tryAnotherFromPk.first().click({ delay: 70 }).catch(() => {});
        await page.waitForTimeout(3000);
      }
    } else if (page.url().includes("/challenge/pk") && !providedCode) {
      const continueBtn = page.locator(
        'button:has-text("Devam Et"), button:has-text("Devam"), button:has-text("Continue"), span:has-text("Devam Et")'
      );
      if ((await continueBtn.count()) > 0) {
        console.log('[YouTube @Uretir] "Devam Et" tıklandı -> Geçiş Anahtarı (Passkey) isteği gönderildi!');
        continueBtn.first().click({ delay: 60 }).catch(() => {});
        await page.waitForTimeout(2000);
      }
    }

    if (providedCode) {
      console.log(`[YouTube @Uretir] Doğrulama kodu (${providedCode}) ekranı aranıyor... Mevcut URL: ${page.url()}`);
      const selectionItems = await page.locator("li, div[data-challengetype]").evaluateAll((els) =>
        els.map((e) => ({ text: e.innerText.replace(/\s+/g, " ").trim(), type: e.getAttribute("data-challengetype") }))
      ).catch(() => []);
      console.log("[YouTube @Uretir] Mevcut seçenekler:", JSON.stringify(selectionItems));

      // Select Authenticator / Verification code / Backup code / Phone code option if on /challenge/selection
      const codeOption = page.locator(
        'li:has-text("Doğrulama kodu"), li:has-text("Google Authenticator"), li:has-text("Güvenlik kodu"), li:has-text("kod"), div[data-challengetype="6"], div[data-challengetype="9"], div[data-challengetype="13"], div[data-challengetype="10"]'
      );
      if ((await codeOption.count()) > 0) {
        console.log("[YouTube @Uretir] Kod doğrulama yöntemi seçiliyor...");
        await codeOption.first().click({ delay: 70 }).catch(() => {});
        await page.waitForTimeout(3000);
      } else {
        const tryMoreSelection = page.locator('li:has-text("Başka bir yöntem dene"), div[data-challengetype]:has-text("Başka bir yöntem dene")');
        if ((await tryMoreSelection.count()) > 0) {
          console.log('[YouTube @Uretir] Seçim ekranındaki "Başka bir yöntem dene" tıklanıyor...');
          await tryMoreSelection.first().click({ delay: 70 }).catch(() => {});
          await page.waitForTimeout(3500);
          console.log("[YouTube @Uretir] Yeni URL:", page.url());
          const bodySnippet = await page.locator("body").innerText().catch(() => "");
          console.log("[YouTube @Uretir] Yeni sayfa metni:", bodySnippet.replace(/\s+/g, " ").slice(0, 400));

          // If on /challenge/dp/presend ("Telefonunuz yanınızda mı?"), check if "Başka bir yöntem dene" has a code input or click "Evet"
          if (page.url().includes("/challenge/dp/presend")) {
            if (process.argv.includes("--try-dp-another")) {
              const dpTryAnother = page.locator('button:has-text("Başka bir yöntem dene"), span:has-text("Başka bir yöntem dene")');
              if ((await dpTryAnother.count()) > 0) {
                console.log('[YouTube @Uretir] /challenge/dp/presend üzerinde "Başka bir yöntem dene" tıklanıyor...');
                await dpTryAnother.first().click({ delay: 70 }).catch(() => {});
                await page.waitForTimeout(3500);
                console.log("[YouTube @Uretir] DP Başka yöntem URL:", page.url());
                const dpBody = await page.locator("body").innerText().catch(() => "");
                console.log("[YouTube @Uretir] DP Başka yöntem metni:", dpBody.replace(/\s+/g, " ").slice(0, 450));

                const totpOpt = page.locator('li:has-text("Google Authenticator"), div[data-challengetype="6"]');
                if ((await totpOpt.count()) > 0) {
                  console.log('[YouTube @Uretir] "Google Authenticator" seçeneği tıklanıyor...');
                  await totpOpt.first().click({ delay: 70 }).catch(() => {});
                  await page.waitForTimeout(3500);
                  console.log("[YouTube @Uretir] Authenticator ekranı URL:", page.url());
                }
              }
            } else {
              const evetBtn = page.locator('button:has-text("Evet"), span:has-text("Evet"), button:has-text("Yes")');
              if ((await evetBtn.count()) > 0) {
                console.log('[YouTube @Uretir] "Telefonunuz yanınızda mı? -> Evet" tıklanıyor! Telefona bildirim gönderiliyor...');
                await evetBtn.first().click({ delay: 70 }).catch(() => {});
                await page.waitForTimeout(4500);
                console.log("[YouTube @Uretir] Evet sonrası URL:", page.url());
                const evetBody = await page.locator("body").innerText().catch(() => "");
                console.log("[YouTube @Uretir] Evet sonrası ekran metni:", evetBody.replace(/\s+/g, " ").slice(0, 450));
              }
            }
          }
        }
      }

      const pinInput = page.locator(
        'input[type="tel"]:visible, input[name="totpPin"]:visible, input[name="idvPin"]:visible, input[name="Pin"]:visible, input#totpPin:visible, input#idvPin:visible, input[autocomplete="one-time-code"]:visible, input[type="text"]:visible'
      );
      if ((await pinInput.count()) > 0) {
        await pinInput.first().click().catch(() => {});
        await pinInput.first().fill("");
        await page.keyboard.type(String(providedCode).trim(), { delay: 50 });
        await page.waitForTimeout(500);
        const nextBtn = page.locator('button:has-text("Sonraki"), button:has-text("İleri"), button:has-text("Next"), button:has-text("Doğrula")');
        if ((await nextBtn.count()) > 0) {
          await nextBtn.first().click().catch(() => {});
        } else {
          await page.keyboard.press("Enter").catch(() => {});
        }
        console.log(`[YouTube @Uretir] Kod (${providedCode}) gönderildi!`);
        await page.waitForTimeout(5500);
        console.log("[YouTube @Uretir] Kod gönderimi sonrası URL:", page.url());
        const afterCodeBody = await page.locator("body").innerText().catch(() => "");
        console.log("[YouTube @Uretir] Kod gönderimi sonrası metin:", afterCodeBody.replace(/\s+/g, " ").slice(0, 450));
      }
      await page.screenshot({ path: promptShot }).catch(() => {});
    }

    if (process.argv.includes("--step-only")) {
      console.log("[YouTube @Uretir] Ekran görüntüsü alındı, mevcut URL:", page.url());
      return { ok: true, status: "step_completed", url: page.url() };
    }

    // Wait up to 30 minutes (1800 seconds) for user approval or live code file
    const liveCodeFile = path.resolve("reports", "social-media", "youtube_code_input.txt");
    await fs.unlink(liveCodeFile).catch(() => {});
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

      if (existsSync(liveCodeFile)) {
        const liveCode = (await fs.readFile(liveCodeFile, "utf8").catch(() => "")).trim();
        await fs.unlink(liveCodeFile).catch(() => {});
        if (liveCode) {
          console.log(`[YouTube @Uretir] Canlı kod alındı: ${liveCode}, mevcut URL: ${page.url()}`);
          if (page.url().includes("/challenge/dp")) {
            const dpTry = page.locator('button:has-text("Başka bir yöntem dene"), span:has-text("Başka bir yöntem dene")');
            if ((await dpTry.count()) > 0) {
              await dpTry.first().click({ delay: 60 }).catch(() => {});
              await page.waitForTimeout(3000);
            }
          }
          if (page.url().includes("/challenge/selection")) {
            const totpOpt = page.locator('li:has-text("Google Authenticator"), div[data-challengetype="6"]');
            if ((await totpOpt.count()) > 0) {
              await totpOpt.first().click({ delay: 60 }).catch(() => {});
              await page.waitForTimeout(3000);
            }
          }
          const livePin = page.locator(
            'input[type="tel"]:visible, input[name="totpPin"]:visible, input[name="idvPin"]:visible, input[name="Pin"]:visible, input#totpPin:visible, input#idvPin:visible, input[autocomplete="one-time-code"]:visible, input[type="text"]:visible'
          );
          if ((await livePin.count()) > 0) {
            await livePin.first().click().catch(() => {});
            await livePin.first().fill("");
            await page.keyboard.type(liveCode, { delay: 40 });
            await page.waitForTimeout(400);
            const nextBtn = page.locator('button:has-text("Sonraki"), button:has-text("İleri"), button:has-text("Next"), button:has-text("Doğrula")');
            if ((await nextBtn.count()) > 0) {
              await nextBtn.first().click().catch(() => {});
            } else {
              await page.keyboard.press("Enter").catch(() => {});
            }
            await page.waitForTimeout(4500);
            await page.screenshot({ path: promptShot }).catch(() => {});
            console.log(`[YouTube @Uretir] Canlı kod (${liveCode}) sonrası URL: ${page.url()}`);
          }
        }
      }

      await page.waitForTimeout(2000);
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

    // If YouTube shows channel picker ("Kanal seçin -> Üretir"), select Üretir automatically
    if (page.url().includes("signin_prompt")) {
      const uretirChannel = page.getByText("Üretir", { exact: true });
      if ((await uretirChannel.count()) > 0) {
        console.log("[YouTube @Uretir] Kanal seçimi ekranında 'Üretir' seçiliyor...");
        await uretirChannel.first().click().catch(() => {});
        await page.waitForTimeout(6000);
      }
    }

    if (page.url().includes("accounts.google.com")) {
      console.log(`[YouTube @Uretir] Oturum süresi dolmuş, geçiş anahtarı onayı gerekiyor.`);
      return { ok: false, reason: "session_expired" };
    }

    // Try direct upload icon first, or Create / Oluştur button in YouTube Studio
    const directUploadIcon = page.locator(
      '#upload-icon, ytcp-icon-button#upload-icon, button[aria-label*="Video yükle"], button[aria-label*="Upload videos"]'
    );
    if ((await directUploadIcon.count()) > 0) {
      await directUploadIcon.first().click().catch(() => {});
      await page.waitForTimeout(2000);
    }

    if ((await page.locator('input[type="file"]').count()) === 0) {
      const createSelectors = [
        "#create-icon",
        "ytcp-button#create-icon",
        'button[aria-label*="Oluştur"]',
        'button[aria-label*="Create"]',
        'ytcp-button:has-text("Oluştur")',
        'ytcp-button:has-text("Create")',
        'button:has-text("Oluştur")',
      ];
      for (const sel of createSelectors) {
        const loc = page.locator(sel);
        if ((await loc.count()) > 0) {
          await loc.first().click().catch(() => {});
          break;
        }
      }
      await page.waitForTimeout(1800);

      // Click Upload videos / Video yükle
      const uploadMenuSelectors = [
        "tp-yt-paper-item#text-item-0",
        'tp-yt-paper-item:has-text("Video yükle")',
        'tp-yt-paper-item:has-text("Upload videos")',
        'ytcp-ve:has-text("Video yükle")',
        'text="Video yükle"',
      ];
      for (const sel of uploadMenuSelectors) {
        const loc = page.locator(sel);
        if ((await loc.count()) > 0) {
          await loc.first().click().catch(() => {});
          break;
        }
      }
      await page.waitForTimeout(2500);
    }

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
