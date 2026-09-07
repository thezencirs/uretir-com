import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { randomUUID } from "node:crypto";
import { getPrisma } from "../lib/puan-ai/db";
import { getCampaignCatalog } from "../lib/puan-ai/catalog-service";
import { deleteConversation, getConversation, getOrCreateConversation, listConversations } from "../lib/puan-ai/conversation-service";
import { createAdminResource, deleteAdminResource, listAdminResources, updateAdminResource } from "../lib/puan-ai/admin-service";
import { evaluateCampaigns } from "../lib/puan-ai/rule-engine";
import { storeCampaignSubmission } from "../lib/puan-ai/intake-service";

async function availablePort() {
  return new Promise<number>((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("Could not allocate a PostgreSQL port."));
      server.close(() => resolvePort(address.port));
    });
  });
}

function runPnpm(args: string[], environment: NodeJS.ProcessEnv) {
  const pnpmScript = process.env.npm_execpath;
  const command = pnpmScript ? process.execPath : "pnpm";
  const commandArgs = pnpmScript ? [pnpmScript, ...args] : args;
  execFileSync(command, commandArgs, {
    cwd: resolve(import.meta.dirname, ".."),
    env: environment,
    stdio: "inherit",
  });
}

async function main() {
  const databaseDir = await mkdtemp(join(tmpdir(), "puanai-postgres-"));
  const port = await availablePort();
  const postgres = new EmbeddedPostgres({
    databaseDir,
    port,
    user: "postgres",
    password: "postgres",
    persistent: false,
    initdbFlags: ["--locale=C", "--encoding=UTF8"],
    onLog: () => undefined,
    onError: (message) => {
      const text = String(message);
      if (!text.includes("database system is ready")) process.stderr.write(`${text}\n`);
    },
  });

  try {
    await postgres.initialise();
    await postgres.start();
    await postgres.createDatabase("puanai_verify");

    const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${port}/puanai_verify`;
    process.env.DATABASE_URL = databaseUrl;
    const environment = { ...process.env, DATABASE_URL: databaseUrl };
    runPnpm(["exec", "prisma", "generate"], environment);

    if (process.argv.includes("--create-migration")) {
      runPnpm(["exec", "prisma", "migrate", "dev", "--name", "puan_ai_v1"], environment);
    } else {
      runPnpm(["exec", "prisma", "migrate", "deploy"], environment);
    }
    runPnpm(["exec", "prisma", "db", "seed"], environment);

    const prisma = getPrisma();
    const counts = await Promise.all([
      prisma.bank.count(),
      prisma.card.count(),
      prisma.campaign.count(),
      prisma.campaignRule.count(),
      prisma.merchant.count(),
      prisma.merchantCategory.count(),
      prisma.rewardType.count(),
      prisma.installment.count(),
      prisma.officialSource.count(),
      prisma.verificationLog.count(),
      prisma.campaignHistory.count(),
    ]);

    if (counts.some((count) => count === 0)) {
      throw new Error(`Normalized seed verification failed: ${counts.join(",")}`);
    }

    const catalog = await getCampaignCatalog();
    const results = evaluateCampaigns(
      catalog,
      "Migros'ta 1.000 TL alışveriş yapacağım, hangi kart avantajlı?",
      new Date("2026-07-25T09:00:00.000Z"),
    );
    if (results.length === 0 || !results.every((campaign) => campaign.verification?.status === "VERIFIED")) {
      throw new Error("Verified campaign lookup did not return a grounded result.");
    }

    const iphone = evaluateCampaigns(
      catalog,
      "iPhone alacağım, taksit var mı?",
      new Date("2026-07-25T09:00:00.000Z"),
    );
    if (iphone.length !== 0) throw new Error("Exclusion rules did not block the iPhone installment claim.");

    const clientKey = randomUUID();
    const conversation = await getOrCreateConversation(clientKey, undefined, "Migros kampanyası");
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: "Migros kampanyası",
        campaignIds: [results[0].id],
      },
    });
    if ((await listConversations(clientKey)).length !== 1) throw new Error("Conversation history was not listed.");
    if (!(await getConversation(clientKey, conversation.id))?.messages.length) throw new Error("Conversation history was not hydrated.");
    if (!(await deleteConversation(clientKey, conversation.id))) throw new Error("Conversation history was not deleted.");

    const adminBank = await createAdminResource("banks", {
      slug: "puanai-verification-bank",
      name: "PuanAI Verification Bank",
      officialName: "PuanAI Verification Bank A.Ş.",
      shortName: "PV",
      websiteUrl: "https://example.com",
      color: "#123456",
      status: "ACTIVE",
    });
    await updateAdminResource("banks", adminBank.id, { name: "PuanAI Verification Bank Updated" });
    if (!(await listAdminResources("banks")).some((bank) => bank.id === adminBank.id)) {
      throw new Error("Admin CRUD did not list the created bank.");
    }
    await deleteAdminResource("banks", adminBank.id);
    const disabledBank = await prisma.bank.findUniqueOrThrow({ where: { id: adminBank.id } });
    if (disabledBank.status !== "INACTIVE") throw new Error("Admin CRUD did not soft-delete the bank.");

    await updateAdminResource("campaigns", results[0].id, { description: `${results[0].description} Doğrulama testi.` });
    const invalidated = await prisma.campaign.findUniqueOrThrow({ where: { id: results[0].id } });
    if (invalidated.published || invalidated.status !== "PENDING_VERIFICATION") {
      throw new Error("Campaign evidence edit did not revoke publication.");
    }
    let staleCampaignRepublished = false;
    try {
      await updateAdminResource("campaigns", results[0].id, { status: "VERIFIED", published: true });
      staleCampaignRepublished = true;
    } catch {
      staleCampaignRepublished = false;
    }
    if (staleCampaignRepublished) throw new Error("Campaign was republished without a fresh verification.");

    const providerMessageId = `verify:${randomUUID()}`;
    const submission = await storeCampaignSubmission({
      providerMessageId,
      channelId: "verification-channel",
      senderId: null,
      text: "Yeni kampanya başladı; resmî kaynak bağlantısı henüz paylaşılmadı.",
      receivedAt: new Date(),
    });
    const duplicate = await storeCampaignSubmission({
      providerMessageId,
      channelId: "verification-channel",
      senderId: null,
      text: "Bu tekrar teslim edilmemeli.",
      receivedAt: new Date(),
    });
    if (submission.status !== "URL_REQUIRED" || duplicate.id !== submission.id || duplicate.rawText !== submission.rawText) {
      throw new Error("WhatsApp intake was not source-gated or idempotent.");
    }

    await prisma.$disconnect();
    process.stdout.write(`PuanAI database verified: ${counts.join("/")} records across required tables; ${results.length} grounded Migros result(s); chat, admin and WhatsApp intake checks passed.\n`);
  } finally {
    await postgres.stop().catch(() => undefined);
    const resolved = resolve(databaseDir);
    const tempRoot = resolve(tmpdir());
    if (resolved.startsWith(tempRoot) && resolved.includes("puanai-postgres-")) {
      await rm(resolved, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
