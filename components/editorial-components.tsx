import Link from "next/link";
import { ArrowUpRight, ExternalLink, UserRound } from "lucide-react";
import { PostCard } from "@/components/post-card";
import type { EditorialAuthor, EditorialFaq, EditorialLink, EditorialSource } from "@/lib/editorial";
import type { Post } from "@/lib/posts";

export type TocItem = { id: string; label: string };

export function TableOfContents({ items }: { items: TocItem[] }) {
  return <nav className="editorial-toc" aria-label="İçindekiler"><p className="eyebrow">İçindekiler</p><ol>{items.map((item, index) => <li key={item.id}><a href={`#${item.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a></li>)}</ol></nav>;
}

export function AuthorBox({ author }: { author: EditorialAuthor }) {
  const initials = author.name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <section className="author-box"><div className="author-box__avatar" aria-hidden="true">{initials || <UserRound size={18} />}</div><div><p className="eyebrow">Yazar</p><h2>{author.name}</h2><p className="author-box__role">{author.role}</p><p className="author-box__bio">{author.bio}</p></div></section>;
}

export function SourcesSection({ sources }: { sources: EditorialSource[] }) {
  return <section className="sources-section"><p className="eyebrow">Kaynaklar</p><h2>Bu içerik neye dayanıyor?</h2><ul>{sources.map((source) => <li key={`${source.href}-${source.title}`}><ExternalLink size={14} /><Link href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel={source.href.startsWith("http") ? "noopener noreferrer" : undefined}>{source.title}</Link>{source.publisher && <span>{source.publisher}</span>}</li>)}</ul></section>;
}

export function FaqSection({ items, title = "Sıkça sorulan sorular" }: { items: EditorialFaq[]; title?: string }) {
  if (!items.length) return null;
  return <section className="faq-section" id="sss"><p className="eyebrow">S.S.S.</p><h2>{title}</h2><div>{items.map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></section>;
}

export function InternalLinkRail({ links }: { links: EditorialLink[] }) {
  return <section className="internal-link-rail" aria-label="İlgili Üretir bağlantıları"><p className="eyebrow">Üretir içinde keşfet</p><div>{links.map((link) => <Link href={link.href} key={link.href}><span>{link.label}</span><small>{link.description}</small><ArrowUpRight size={15} /></Link>)}</div></section>;
}

export function RelatedArticles({ posts, title = "Bunlara da bakın." }: { posts: Post[]; title?: string }) {
  if (!posts.length) return null;
  return <section className="related-articles"><div className="related-articles__heading"><div><p className="eyebrow">Sıradaki okumalar</p><h2>{title}</h2></div><Link href="/blog" className="link-arrow">Arşive dön <ArrowUpRight size={15} /></Link></div><div className="related-articles__grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div></section>;
}

