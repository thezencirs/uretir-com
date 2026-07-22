import type { Company } from "@/lib/companies";
import type { Post } from "@/lib/posts";

export type EditorialAuthor = { name: string; role: string; bio: string };
export type EditorialSource = { title: string; href: string; publisher?: string };
export type EditorialFaq = { question: string; answer: string };
export type EditorialSection = { id: string; eyebrow: string; title: string; paragraphs: string[] };
export type EditorialLink = { label: string; description: string; href: string };

export type EditorialData = {
  author: EditorialAuthor;
  updatedAt: string;
  sections: EditorialSection[];
  faq: EditorialFaq[];
  sources: EditorialSource[];
  internalLinks: EditorialLink[];
};

const articleAuthor: EditorialAuthor = {
  name: "Üretir Editoryal",
  role: "Araştırma ve İçerik",
  bio: "Üretim, teknoloji ve yapay zekâ kesişiminde çalışan Üretir araştırma ekibi.",
};

const categoryPaths: Record<string, string> = {
  "Yapay Zeka": "yapay-zeka",
  Fabrikalar: "fabrikalar",
  Mimarlık: "mimarlik",
  Üretim: "uretim",
  Teknoloji: "teknoloji",
  Girişimcilik: "girisimcilik",
};

export function getArticleEditorial(post: Post): EditorialData {
  const categoryPath = categoryPaths[post.category] ?? "blog";
  return {
    author: articleAuthor,
    updatedAt: post.updatedAt ?? post.publishedAt,
    sections: [
      { id: "soruyu-kurmak", eyebrow: "01 / Başlangıç", title: "Soruyu doğru kurmak", paragraphs: [`${post.title} üzerine düşünürken ilk adım, problemi aceleyle çözmeye çalışmak değil; onu doğru çerçevelemek. Üretim kültürü, merakı ölçülebilir bir soruya dönüştürdüğümüzde gerçek bir ivme kazanıyor.`, "İyi bir başlangıç, herkesin aynı şeyi gördüğünü varsaymak yerine farklı bakışları masaya davet ediyor. Böylece fikir yalnızca bir niyet olarak kalmıyor; test edilebilir bir varsayıma dönüşüyor."] },
      { id: "sistemi-kurmak", eyebrow: "02 / Asıl mesele", title: "Sistemi kurmak, sonucu beklemekten önemli", paragraphs: [`${post.category} alanında kalıcı değer tek bir parlak sonuçtan değil, tekrar edilebilen küçük adımlardan oluşuyor. Araçlar değişebilir; fakat öğrenme, deneme ve geri bildirim döngüsü her zaman sistemin merkezinde kalıyor.`, "Bu yüzden ilk prototipin kusursuz olması gerekmiyor. Önemli olan onu yeterince görünür kılmak, doğru kişilere göstermek ve bir sonraki kararı veriyle verebilmek."] },
      { id: "ilk-adim", eyebrow: "03 / Uygulama", title: "İlk adımı küçültmek", paragraphs: ["Büyük fikirler çoğu zaman küçük ve net bir hareketle başlıyor. Bir görüşme yapmak, bir akışı çizmek ya da tek bir kullanıcı davranışını gözlemlemek; belirsizliği azaltmak için yeterli olabilir.", "Üretir'in önerisi basit: bugün ölçebileceğin bir adım seç, onu paylaş ve bir sonraki soruyu cevabın içinden çıkar. Böylece fikir, anlatılan bir ihtimal olmaktan çıkıp yaşayan bir pratiğe dönüşür."] },
    ],
    faq: [
      { question: `${post.title} neden önemli?`, answer: `${post.category} alanındaki değişimleri anlamak, daha iyi kararlar almak ve fikri uygulanabilir bir üretim sürecine dönüştürmek için önemlidir.` },
      { question: "Bu konuya başlamak için ilk adım ne olabilir?", answer: "Problemi küçük bir soruya indirmek, mevcut kaynakları listelemek ve kısa bir deneme planı hazırlamak iyi bir başlangıçtır." },
    ],
    sources: [
      { title: `${post.category} arşivi`, href: `/kategori/${categoryPath}`, publisher: "Üretir" },
      { title: "Üretir hakkında", href: "/hakkimizda", publisher: "Üretir Editoryal" },
    ],
    internalLinks: [
      { label: `${post.category} arşivini keşfet`, description: "Bu alandaki diğer fikir ve analizlere göz at.", href: `/kategori/${categoryPath}` },
      { label: "Türkiye'nin üretim atlası", description: "Şirketleri, sektörleri ve üretim hikâyelerini incele.", href: "/ne-uretir" },
      { label: "PuanAI ile avantajı bul", description: "Alışveriş öncesi doğru kart ve kampanyayı keşfet.", href: "/puan-ai" },
    ],
  };
}

export function getCompanyEditorial(company: Company): Pick<EditorialData, "author" | "updatedAt" | "sources" | "internalLinks"> {
  return {
    author: { name: "Üretir Araştırma Ekibi", role: "Üretim Atlası", bio: "Türkiye'de üretim yapan şirketleri ve onların dünyaya kattığı değeri araştırıyoruz." },
    updatedAt: "2026-07-20",
    sources: [{ title: `${company.name} resmi web sitesi`, href: company.website, publisher: company.name }, { title: "Üretim Atlası", href: "/ne-uretir", publisher: "Üretir" }],
    internalLinks: [{ label: "Tüm üretim atlasını gör", description: "Türkiye'nin üretici şirketlerini keşfet.", href: "/ne-uretir" }, { label: "Üretim üzerine yazılar", description: "Üretim, teknoloji ve şirket kültürü üzerine analizler.", href: "/kategori/uretim" }, { label: "Üretir ekosistemini keşfet", description: "Araçlar, içerikler ve yeni üretim fikirleri.", href: "/ekosistem" }],
  };
}

