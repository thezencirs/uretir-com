import type { HubGuide } from "@/lib/content-hubs";
import type { ContentBlock, ContentDocument } from "@/lib/content-model";
import { createSearchIntentProfile } from "@/lib/search-intent";

const author = {
  name: "Üretir Editoryal",
  role: "Araştırma ve İçerik",
  bio: "Üretim kararlarını kaynak, belirsizlik ve uygulama bağlamıyla açıklayan editoryal ekip.",
};

export function createHubGuideDocument(guide: HubGuide): ContentDocument {
  const sourceRecords = guide.editorial?.sources ?? guide.sources;
  const blocks: ContentBlock[] = [
    { type: "summary", id: "ozet", title: "Hızlı cevap", items: [guide.quickAnswer] },
    { type: "paragraph", text: guide.description, lead: true },
    ...Object.entries(guide.answers).flatMap(([key, answer], index): ContentBlock[] => [
      { type: "heading", id: `cevap-${key}`, level: 2, eyebrow: String(index + 1).padStart(2, "0"), text: answerTitle(key) },
      { type: "paragraph", text: answer },
    ]),
    ...(guide.examples ?? []).map((example): ContentBlock => ({ type: "example", id: slugify(example.title), ...example })),
    ...(guide.advantages?.length || guide.disadvantages?.length
      ? [{ type: "pros-cons", id: "avantajlar-ve-sinirlamalar", advantages: guide.advantages ?? [], disadvantages: guide.disadvantages ?? [] } satisfies ContentBlock]
      : []),
    ...(guide.useCases?.length
      ? [
          { type: "heading", id: "kullanim-senaryolari", level: 2, eyebrow: "Uygulama", text: "Kullanım senaryoları" } satisfies ContentBlock,
          { type: "company-list", id: "senaryolar", title: "Nerede kullanılır?", items: guide.useCases } satisfies ContentBlock,
        ]
      : []),
    ...(guide.keyTakeaways?.length ? [{ type: "key-takeaways", id: "onemli-cikarimlar", items: guide.keyTakeaways } satisfies ContentBlock] : []),
    {
      type: "entity-links",
      id: "ilgili-kaynaklar",
      title: "İlgili rehberler ve ürünler",
      items: [
        ...guide.relatedGuideSlugs.map((slug) => ({ label: slug.replaceAll("-", " "), href: `/rehber/${slug}`, kind: "guide" })),
        ...guide.relatedPaths.map((path) => ({ label: path.label, href: path.href, kind: path.type })),
      ],
    },
    { type: "faq", id: "sss", items: guide.faq },
    { type: "editor-note", id: "editor-incelemesi", text: "Bu rehber kaynak ve alan uzmanı incelemesi tamamlanana kadar yayımlanmış referans sayılmaz.", updatedAt: guide.updatedAt },
  ];
  const internalLinks = [
    ...guide.relatedGuideSlugs.map((slug) => ({ label: slug.replaceAll("-", " "), description: "İlgili editoryal rehber", href: `/rehber/${slug}` })),
    ...guide.relatedPaths.map((path) => ({ label: path.label, description: path.type, href: path.href })),
  ];

  return {
    id: `guide:${guide.slug}`,
    kind: "guide",
    slug: guide.slug,
    locale: "tr-TR",
    status: guide.status,
    trustState: guide.status === "published" ? "verified" : "editorial_review",
    title: guide.title,
    excerpt: guide.description,
    category: guide.hubId,
    tags: guide.relatedTopics,
    author,
    publishedAt: guide.editorial?.publishedAt ?? guide.createdAt,
    updatedAt: guide.editorial?.updatedAt ?? guide.updatedAt,
    readTime: `${guide.editorial?.readingTimeMinutes ?? guide.readingTimeMinutes} dk okuma`,
    blocks,
    faq: guide.faq,
    sources: sourceRecords.map((source) => ({ title: source.title, href: source.href, publisher: source.publisher })),
    internalLinks,
    relatedSlugs: guide.relatedGuideSlugs,
    searchIntent: createSearchIntentProfile({ primary: guide.intent, secondary: ["rehber"], userQuestion: guide.question, decisionStage: guide.intent === "doğrulama" ? "verification" : guide.intent === "hazırlık" ? "preparation" : "discovery" }),
    editorial: guide.editorial,
    entityRelations: [
      { entityId: `guide:${guide.slug}`, kind: "guide", relationship: "primary_subject", label: guide.title, canonicalPath: `/rehber/${guide.slug}` },
      { entityId: `ai-product:${guide.hubId}`, kind: "ai_product", relationship: "belongs_to", label: guide.hubId, canonicalPath: `/${guide.hubId}` },
      ...guide.relatedGuideSlugs.map((slug) => ({ entityId: `guide:${slug}`, kind: "guide" as const, relationship: "related_to" as const, label: slug.replaceAll("-", " "), canonicalPath: `/rehber/${slug}` })),
      ...(guide.entityRelations ?? []),
    ],
    seo: { title: guide.title, description: guide.description, canonicalPath: `/rehber/${guide.slug}`, keywords: guide.relatedTopics },
  };
}

function answerTitle(key: string) {
  return ({ what: "Nedir?", why: "Neden önemlidir?", how: "Nasıl uygulanır?", who: "Kimler içindir?", when: "Ne zaman kullanılır?", where: "Nerede doğrulanır?" } as Record<string, string>)[key] ?? key;
}

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
