import { describe, expect, it } from "vitest";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { newsStatus, publicNews, siteContentSchema, todayInTurkey } from "@/lib/site-content-model";

describe("site content publishing contract", () => {
  it("validates the researched content and covers all five categories", () => {
    expect(siteContentSchema.safeParse(defaultSiteContent).success).toBe(true);
    expect(new Set(defaultSiteContent.news.map(item => item.category)).size).toBe(5);
  });
  it("rejects duplicate routes and dangerous source URLs", () => {
    const content = structuredClone(defaultSiteContent);
    content.nav[1].href = "/";
    expect(siteContentSchema.safeParse(content).success).toBe(false);
    content.nav[1].href = "/gelismeler";
    content.news[0].sourceUrl = "javascript:alert(1)";
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
  it("keeps hidden, unchecked-future and future-published news private", () => {
    const item = defaultSiteContent.news[0];
    expect(publicNews([{ ...item, visible: false }, { ...item, publishedAt: "2026-09-12" }, { ...item, checkedAt: "2026-09-12" }], "2026-09-11")).toEqual([]);
  });
  it("computes deadlines and event status instead of freezing them in copy", () => {
    const item = defaultSiteContent.news[0];
    expect(newsStatus({ ...item, deadline: "2026-09-11" }, "2026-09-12")).toBe("Başvuru süresi doldu");
    expect(newsStatus({ ...item, deadline: null, eventStart: "2026-09-10", eventEnd: "2026-09-12" }, "2026-09-11")).toBe("Etkinlik devam ediyor");
    expect(todayInTurkey(new Date("2026-09-10T21:30:00Z"))).toBe("2026-09-11");
  });
  it("rejects inverted event dates", () => {
    const content = structuredClone(defaultSiteContent);
    content.news[0].eventStart = "2026-09-12";
    content.news[0].eventEnd = "2026-09-11";
    expect(siteContentSchema.safeParse(content).success).toBe(false);
  });
});
