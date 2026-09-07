import { describe, expect, it } from "vitest";
import { checkRobotsPolicy, evaluateRobotsText } from "@/lib/puan-ai/robots-policy";

describe("PuanAI robots policy", () => {
  it("uses the longest matching allow/disallow rule", () => {
    const text = "User-agent: *\nDisallow: /kampanyalar\nAllow: /kampanyalar/acik";
    expect(evaluateRobotsText(text, "/kampanyalar/acik/1")).toBe(true);
    expect(evaluateRobotsText(text, "/kampanyalar/gizli")).toBe(false);
  });

  it("fails closed when robots.txt is unavailable", async () => {
    const decision = await checkRobotsPolicy(new URL("https://bank.example/kampanya"), (async () => new Response("", { status: 503 })) as typeof fetch);
    expect(decision.allowed).toBe(false);
  });

  it("allows a missing robots.txt", async () => {
    const decision = await checkRobotsPolicy(new URL("https://bank.example/kampanya"), (async () => new Response("", { status: 404 })) as typeof fetch);
    expect(decision.allowed).toBe(true);
  });
});
