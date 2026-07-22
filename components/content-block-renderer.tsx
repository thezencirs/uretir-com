import { AdSlot } from "@/components/ad-slot";
import { AuthorBox, FaqSection, InternalLinkRail, SourcesSection } from "@/components/editorial-components";
import type { ContentBlock } from "@/lib/content-model";

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="content-blocks">{blocks.map((block, index) => {
    switch (block.type) {
      case "paragraph": return <p key={index} className={block.lead ? "editorial-lede" : undefined}>{block.text}</p>;
      case "heading": return <section key={block.id} id={block.id} className="editorial-section"><p className="eyebrow">{block.eyebrow}</p>{block.level === 2 ? <h2>{block.text}</h2> : <h3>{block.text}</h3>}</section>;
      case "quote": return <blockquote key={index}>{block.text}{block.cite && <cite>— {block.cite}</cite>}</blockquote>;
      case "ad": return <AdSlot key={index} format={block.format} />;
      case "company-text": return <section key={block.id} id={block.id} className="editorial-section editorial-section--company"><p className="eyebrow">{block.eyebrow}</p><p className="mt-4 text-base leading-7 text-muted">{block.text}</p></section>;
      case "company-products": return <section key={block.id} id={block.id} className="mt-14 border-t hairline pt-10"><p className="eyebrow">{block.title}</p><div className="mt-6 flex flex-wrap gap-2">{block.items.map((item) => <span key={item} className={`rounded-full border hairline px-3 py-1.5 text-sm ${block.muted ? "text-muted" : ""}`}>{item}</span>)}</div></section>;
      case "company-list": return <section key={block.id} id={block.id} className="mt-14 border-t hairline pt-10"><p className="eyebrow">{block.title}</p><div className="mt-6 grid gap-3">{block.items.map((item, itemIndex) => <div key={item} className="flex items-center gap-4 text-sm">{block.numbered && <span className="font-display text-lg text-muted/30">{String(itemIndex + 1).padStart(2, "0")}</span>}<span>{item}</span></div>)}</div></section>;
      case "author": return <AuthorBox key={index} author={block.author} />;
      case "sources": return <SourcesSection key={index} sources={block.sources} />;
      case "internal-links": return <InternalLinkRail key={index} links={block.links} />;
      case "faq": return <FaqSection key={block.id} items={block.items} title={block.title} />;
    }
  })}</div>;
}

