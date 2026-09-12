import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { z } from "zod";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, ".local");
mkdirSync(directory, { recursive: true });
const configPath = resolve(directory, "editor.json");
const schema = z.object({ password: z.string(), adminPassword: z.string(), secret: z.string(), port: z.number() });
const config = existsSync(configPath) ? schema.parse(JSON.parse(readFileSync(configPath, "utf8"))) : {
  password: randomBytes(24).toString("hex"), adminPassword: randomBytes(18).toString("base64url"), secret: randomBytes(48).toString("hex"), port: 55439,
};
const envPath = resolve(root, ".env");
const url = "postgresql://postgres:" + config.password + "@127.0.0.1:" + config.port + "/uretir_editor";
if (existsSync(envPath) && !readFileSync(envPath, "utf8").includes(url)) throw new Error("Existing .env belongs to another configuration; leave it intact and use its database.");
writeFileSync(configPath, JSON.stringify(config), { mode: 0o600 });
const databaseDir = resolve(process.env.LOCALAPPDATA ?? directory, "uretir-editor", createHash("sha256").update(root).digest("hex").slice(0, 12), "postgres");
const postgres = new EmbeddedPostgres({ databaseDir, port: config.port, user: "postgres", password: config.password, persistent: true, postgresFlags: ["-h", "127.0.0.1"], initdbFlags: ["--locale=C", "--encoding=UTF8"], onLog: () => undefined, onError: () => undefined });
if (!existsSync(resolve(databaseDir, "PG_VERSION"))) await postgres.initialise();
await postgres.start();
const client = postgres.getPgClient("postgres");
await client.connect();
const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ["uretir_editor"]);
await client.end();
if (!existing.rowCount) await postgres.createDatabase("uretir_editor");
writeFileSync(envPath, 'DATABASE_URL="' + url + '"\nPUANAI_ADMIN_PASSWORD="' + config.adminPassword + '"\nPUANAI_SESSION_SECRET="' + config.secret + '"\n', { mode: 0o600 });
execFileSync(process.execPath, [resolve(root, "node_modules/prisma/build/index.js"), "migrate", "deploy"], { cwd: root, env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
writeFileSync(resolve(directory, "EDITOR-GIRIS.txt"), "Yalnızca bu bilgisayardaki önizleme için:\nhttp://localhost:3000/yonetici\nYönetici parolası: " + config.adminPassword + "\n\nBu dosyayı paylaşmayın. Canlı site için ayrı sunucu ayarları gerekir.\n", { mode: 0o600 });
console.log("Local editor database ready. Access details: .local/EDITOR-GIRIS.txt");
let stopping = false;
async function stop() { if (stopping) return; stopping = true; await postgres.stop(); process.exit(0); }
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => undefined, 60_000);
