# 12 Eylül 2026 — Navigasyon ve kategori düzeni

Menü kaynağı: lib/site-navigation.ts. Beş kategori: Gelişmeler, Ekosistem, Çözümler, Girişimler, Kaynaklar. Header masaüstü/mobil aynı bağlantı ağacını kullanır; eski site_content.nav düz listesi artık header için kullanılmaz. Editörde bu alanın eski düzenleme kontrolleri kaldırıldı; diğer içerik düzenleme işlevleri korunur.

Slogan: Türkiye üretir, gençler yetişir. Logo yanı, footer, varsayılan SEO başlığı/açıklaması ve Organization schema güncellendi.
Yeni kategori sayfaları özgün canonical adreslere sahiptir; HaberAI/FinansAI üzerinde ana sayfadan miras kalan canonical düzeltildi. Hazır kategori merkezleri sitemap ve site aramasına eklendi. Hazırlık ürünleri ve boş ekosistem veri sayfaları noindex,follow olarak bırakıldı.

Ekosistem bağımsız girişimlere ayrılır. Harita 81 ilde seçim sağlar. lib/startup-directory.ts doğrulanmış kayıt şemasıdır; liste şu an boştur. Marketplace keşif katalog arayüzüdür; ödeme/sipariş yoktur. Marketcap kaynak, tarih, TL piyasa değeri ve risk açıklamaları için alanlar sunar; veri uydurulmaz. Piyasa değeri, özel şirket değerlemesi ve halka açıklık oranı aynı şey değildir.

MimarAI, OyunAI, İndirimAI, GüzelAI, APP, Topluluk, E-kitaplar ve Forum hazırlık sayfalarıdır; gerçek hizmet olarak sunulmaz. Mevcut ürün yolları korunur.

Doğrulama: 28 menü bağlantısı HTTP 200; klavye Enter/Escape, dışarı tıklama, mobil bağlantı sonrası kapanma; açık/koyu tema ekran görüntüleri; 320 ve 390 pikselde yatay taşma yok; örnek canonical ve noindex kontrolü; TypeScript, değişen dosyalarda ESLint ve üretim derlemesi geçti.
