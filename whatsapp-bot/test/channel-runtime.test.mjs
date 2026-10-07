import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveVerifiedChannel, runChannelCycle, assertFeedAvailable } from "../src/channel-runtime.mjs";

const target = { key: "haberai", name: "HaberAI", inviteCode: "0029VbDk4gHGpLHXkGseaf3Y" };
const valid = { id: "1234@newsletter", name: "HaberAI", inviteLink: `https://whatsapp.com/channel/${target.inviteCode}`, membershipType: "owner" };
function client(metadata, chat = { isChannel: true, id: { _serialized: metadata.id } }) {
  return {
    pupPage: { evaluate: async (_fn, code) => { assert.equal(code, target.inviteCode); return metadata; } },
    getChatById: async id => { assert.equal(id, metadata.id); return chat; },
  };
}
test("resolves a renamed channel by its exact invite and verified owner/admin role", async () => {
  for (const role of ["owner", "admin", "ADMIN"]) {
    const result = await resolveVerifiedChannel(client({ ...valid, name: "New title", membershipType: role }), target);
    assert.equal(result.id, valid.id);
  }
});
test("unknown, guest and subscriber roles cannot publish", async () => {
  for (const membershipType of [undefined, "", "guest", "subscriber"]) {
    await assert.rejects(resolveVerifiedChannel(client({ ...valid, membershipType }), target), /owner\/admin/);
  }
});
test("matching display name cannot authorize a different invite or private destination", async () => {
  await assert.rejects(resolveVerifiedChannel(client({ ...valid, inviteLink: "https://whatsapp.com/channel/other" }), target), /davet/);
  for (const id of ["1234@c.us", "1234@g.us", "1234@broadcast", "@newsletter"]) {
    await assert.rejects(resolveVerifiedChannel(client({ ...valid, id }), target), /geçerli/);
  }
});
test("hydrated channel must match the verified identity", async () => {
  await assert.rejects(resolveVerifiedChannel(client(valid, { isChannel: true, id: { _serialized: "9999@newsletter" } }), target), /kimliği/);
});
test("a channel failure fails the cycle but does not skip the remaining channels", async () => {
  const targets = [target, { key: "finansai" }, { key: "evai" }];
  const visited = [], reports = [];
  const cycle = await runChannelCycle(targets, async t => {
    visited.push(t.key);
    if (t === target) throw new Error("role unavailable");
    return { sent: false, status: "veri değişmedi" };
  }, (t, result) => reports.push(result));
  assert.deepEqual(visited, targets.map(t => t.key));
  assert.equal(cycle.ok, false);
  assert.deepEqual(reports.map(r => r.ok), [false, true, true]);
});
test("a healthy cycle with no new content succeeds", async () => {
  const cycle = await runChannelCycle([target], async () => ({ sent: false, status: "veri değişmedi" }), () => {});
  assert.equal(cycle.ok, true);
});
test("HTTP 200 unavailable payloads fail; legitimate empty history is accepted", () => {
  assert.throws(() => assertFeedAvailable({ body: null, status: "temporarily_unavailable" }));
  assert.throws(() => assertFeedAvailable({ error: "database unavailable" }));
  assert.doesNotThrow(() => assertFeedAvailable({ body: null, status: "price_history_accumulating" }));
});
