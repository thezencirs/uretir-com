/** Resolve identity and role from the invite-code lookup, never a display name. */
export async function resolveVerifiedChannel(client, target) {
  const metadata = await client.pupPage.evaluate(async (inviteCode) => {
    const channel = await window.WWebJS.getChannelMetadata(inviteCode);
    return {
      id: channel.id?._serialized || channel.id?.toString?.(),
      name: channel.titleMetadata?.title,
      inviteLink: channel.inviteLink,
      membershipType: channel.membershipType,
    };
  }, target.inviteCode);

  const expectedUrl = `https://whatsapp.com/channel/${target.inviteCode}`;
  if (metadata?.inviteLink !== expectedUrl) {
    throw new Error(`${target.name} kanal davet bağlantısı doğrulanamadı.`);
  }
  if (typeof metadata.id !== "string" || !/^\d+@newsletter$/.test(metadata.id)) {
    throw new Error(`${target.name} hedefi geçerli bir WhatsApp kanalı değil.`);
  }
  const role = String(metadata.membershipType || "").toLowerCase();
  if (!["owner", "admin"].includes(role)) {
    throw new Error(`${target.name} kanalında owner/admin yetkisi doğrulanamadı (${role || "bilinmiyor"}).`);
  }

  // Hydrate the exact channel before the existing send path reads its cache.
  const channel = await client.getChatById(metadata.id);
  if (!channel?.isChannel || channel.id?._serialized !== metadata.id) {
    throw new Error(`${target.name} kanal kimliği yüklenemedi.`);
  }
  return { id: metadata.id, name: metadata.name, membershipType: role };
}

/** Preserve other channels' progress while propagating any failure to the job. */
export async function runChannelCycle(targets, publish, report) {
  const results = [];
  for (const target of targets) {
    let result;
    try {
      result = { ...await publish(target), key: target.key, ok: true };
    } catch (error) {
      result = { key: target.key, ok: false, status: error instanceof Error ? error.message : String(error) };
    }
    results.push(result);
    report(target, result);
  }
  return { ok: results.every(result => result.ok), results };
}

export function assertFeedAvailable(payload) {
  if (!payload || typeof payload !== "object" || payload.error || payload.status === "temporarily_unavailable") {
    throw new Error("Kanal veri kaynağı geçici olarak kullanılamıyor.");
  }
  return payload;
}
