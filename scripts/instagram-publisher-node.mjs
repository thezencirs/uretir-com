import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const requireStack = createRequire(
  path.resolve(".local", "open-source-stack", "package.json")
);

export async function publishToInstagramNode({ videoPath, coverPngPath, caption, slot }) {
  const username = (process.env.IG_USERNAME || "uretirai").replace(/^@/, "").trim();
  const password = (process.env.IG_PASSWORD || "").trim();

  if (!password) {
    console.log("[Instagram Node] IG_PASSWORD tanımlı değil.");
    return { ok: false, reason: "missing_password" };
  }

  let IgApiClient;
  try {
    ({ IgApiClient } = requireStack("instagram-private-api"));
  } catch (err) {
    console.warn("[Instagram Node] instagram-private-api yüklenemedi:", err?.message || err);
    return { ok: false, reason: "module_missing" };
  }

  const outDir = path.dirname(coverPngPath);
  const jpgCoverPath = path.join(outDir, `uretir-cover-${slot || "live"}.jpg`);
  const storyJpgPath = path.join(outDir, `uretir-story-${slot || "live"}.jpg`);

  // Convert PNG cover to 1080x1920 JPEG (for Reel cover & Story) and 1080x1350 JPEG (4:5 for Feed Photo)
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

  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  const sessionPath = path.resolve("reports", "social-media", "ig_node_session.json");
  const resultPath = path.resolve("reports", "social-media", "ig_last_publish.json");

  try {
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

    // 1. Update biography & external_url to uretir.com so all traffic flows to uretir.com
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
        console.log("[Instagram @uretirai] Biyografi ve web sitesi linki https://www.uretir.com olarak güncellendi.");
      }
    } catch (bioErr) {
      console.log("[Instagram Bio Bilgi]:", bioErr?.message || bioErr);
    }

    const published = [];

    // 2. Publish Vertical Video (Reels / Video Post)
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

    // 3. Publish Visual Card Feed Post (4:5 high-engagement carousel/card driving traffic to uretir.com)
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

    // 4. Publish 9:16 Vertical Story
    try {
      const storyBuffer = await fs.readFile(storyJpgPath);
      const storyRes = await ig.publish.story({
        file: storyBuffer,
      });
      const pk = storyRes?.media?.pk || "";
      published.push({ type: "story", pk: String(pk) });
      console.log(`PUBLISHED_OK type=story pk=${pk}`);
    } catch (sErr) {
      console.warn("[Instagram Story Bilgi]:", sErr?.message || sErr);
    }

    await fs.writeFile(
      resultPath,
      JSON.stringify(
        {
          username,
          publishedAt: new Date().toISOString(),
          published,
        },
        null,
        2
      ),
      "utf8"
    );

    return { ok: published.length > 0, published };
  } catch (err) {
    console.warn("[Instagram Node Uyarısı]:", err?.message || err);
    await fs.mkdir(path.dirname(resultPath), { recursive: true });
    await fs.writeFile(
      resultPath,
      JSON.stringify(
        {
          username,
          attemptedAt: new Date().toISOString(),
          error: err?.message || String(err),
        },
        null,
        2
      ),
      "utf8"
    );
    return { ok: false, error: err?.message || String(err) };
  }
}
