export type Post = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  accent: string;
  number: string;
  featured?: boolean;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
};

export const categories = [
  { name: "Yapay Zeka", slug: "yapay-zeka", count: "12 yazı", color: "blue", description: "Yeni araçlar, yeni düşünme biçimleri ve insan-makine iş birliği.", symbol: "01" },
  { name: "Üretim", slug: "uretim", count: "08 yazı", color: "orange", description: "Malzemeden makineye, bir fikrin dünyaya değdiği an.", symbol: "02" },
  { name: "Teknoloji", slug: "teknoloji", count: "16 yazı", color: "violet", description: "Bugünü dönüştüren ve yarını şekillendiren sistemler.", symbol: "03" },
  { name: "Mimarlık", slug: "mimarlik", count: "06 yazı", color: "green", description: "Mekân, malzeme ve yaşamın birbirine değdiği yer.", symbol: "04" },
  { name: "Fabrikalar", slug: "fabrikalar", count: "09 yazı", color: "red", description: "Büyük fikirlerin somutlaştığı, veriyle nefes alan yerler.", symbol: "05" },
  { name: "Girişimcilik", slug: "girisimcilik", count: "04 yazı", color: "blue", description: "Belirsizlikle çalışmak ve ilk adımı atmak üzerine.", symbol: "06" },
];

export const posts: Post[] = [
  {
    slug: "yapay-zeka-ile-fikri-prototipe-donusturmek",
    category: "Yapay Zeka",
    title: "Yapay zekâ ile fikri prototipe dönüştürmek",
    excerpt: "Bir fikrin ilk çizgisinden çalışan prototipe uzanan yolda yeni araçları nasıl konumlandırıyoruz?",
    date: "18 Temmuz 2026",
    readTime: "8 dk okuma",
    author: "Deniz Kaya",
    authorRole: "Kurucu Editör",
    accent: "blue",
    number: "01",
    featured: true,
    tags: ["Yapay Zeka", "Prototipleme", "Tasarım"],
    publishedAt: "2026-07-18",
  },
  {
    slug: "gelecegin-fabrikasi-veriyle-nefes-alan-sistemler",
    category: "Fabrikalar",
    title: "Geleceğin fabrikası: Veriyle nefes alan sistemler",
    excerpt: "Otomasyonun ötesinde, kendini gözlemleyen ve öğrenen üretim hatlarına yakından bakıyoruz.",
    date: "12 Temmuz 2026",
    readTime: "6 dk okuma",
    author: "Mert Alkan",
    authorRole: "Endüstri Yazarı",
    accent: "orange",
    number: "02",
    tags: ["Otomasyon", "Veri", "Endüstri 4.0"],
    publishedAt: "2026-07-12",
  },
  {
    slug: "iyi-tasarim-ve-iyi-muhendislik-arasinda",
    category: "Mimarlık",
    title: "İyi tasarım ile iyi mühendislik arasında",
    excerpt: "Bir yapıyı ya da ürünü kalıcı kılan şey çoğu zaman görünenin arkasındaki dengedir.",
    date: "04 Temmuz 2026",
    readTime: "5 dk okuma",
    author: "Selin Aras",
    authorRole: "Mimar & Araştırmacı",
    accent: "violet",
    number: "03",
    tags: ["Tasarım", "Mühendislik", "Mimarlık"],
    publishedAt: "2026-07-04",
  },
  {
    slug: "3d-yaziciyla-uretimde-yeni-baslangiclar",
    category: "Üretim",
    title: "3D yazıcıyla üretimde yeni başlangıçlar",
    excerpt: "Masaüstü bir makine, doğru soruyla birleştiğinde nasıl küçük bir atölyeye dönüşüyor?",
    date: "29 Haziran 2026",
    readTime: "7 dk okuma",
    author: "Bora Yıldız",
    authorRole: "Maker & Ürün Geliştirici",
    accent: "green",
    number: "04",
    tags: ["3D Yazıcı", "Maker", "Malzeme"],
    publishedAt: "2026-06-29",
  },
  {
    slug: "uretkenlik-icin-sistem-kurmak",
    category: "Teknoloji",
    title: "Daha çok değil, daha anlamlı üretmek",
    excerpt: "Üretkenlik uygulamalarının ötesinde, enerjimizi koruyan basit bir çalışma sistemi.",
    date: "21 Haziran 2026",
    readTime: "4 dk okuma",
    author: "Ece Tunç",
    authorRole: "Editör",
    accent: "red",
    number: "05",
    tags: ["Üretkenlik", "Çalışma", "Sistem"],
    publishedAt: "2026-06-21",
  },
  {
    slug: "sifirdan-girisim-kurarken-ilk-90-gun",
    category: "Girişimcilik",
    title: "Sıfırdan girişim kurarken ilk 90 gün",
    excerpt: "Belirsizlikle çalışmayı öğrenmek, iyi bir fikri hayata geçirmenin ilk adımı olabilir.",
    date: "14 Haziran 2026",
    readTime: "9 dk okuma",
    author: "Deniz Kaya",
    authorRole: "Kurucu Editör",
    accent: "blue",
    number: "06",
    tags: ["Girişim", "İş Fikri", "Başlangıç"],
    publishedAt: "2026-06-14",
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getPostsByCategory(slug: string) {
  const category = getCategory(slug);
  if (!category) return [];
  return posts.filter((post) => post.category === category.name);
}
