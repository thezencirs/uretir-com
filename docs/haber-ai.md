# HaberAI işletim notları

Harita 81 ilin gerçek SVG sınırlarını kullanır. Tıklama, klavye, şehir seçimi, yayın günü (Europe/Istanbul), metin araması ve tüm sonuçlara ilerlemeli erişim vardır. Masaüstü harita/haber sütunları 1.618:1 oranındadır.

## Veri akışı
Üç TRT Haber RSS akışı: Türkiye, ekonomi, bilim-teknoloji. Başlık ve özet açık şehir adlarıyla eşleştirilir. Kaynak görseli, bağlantısı ve yayın tarihi saklanır. Bu kapsam tüm yayıncıları veya her şehirdeki tüm olayları kapsamaz. Arşiv toplama başladıktan sonra birikir; RSS dışındaki eski içerik kendiliğinden bulunmaz.
PostgreSQL haber_articles ve haber_runs tabloları Prisma SQL migration ile oluşturulur.
pnpm haber-ai:collect tekrarları aynı haber kimliğiyle birleştirir; eşzamanlı taramalar PostgreSQL danışma kilidiyle korunur. Kaynak hataları ayrı kaydedilir. Tüm kaynaklar başarısızsa komut başarısız çıkar.
Mevcut Codex otomasyonu günlük saat 08.00 olarak güncellendi. Yerel makine, Codex ve veritabanı erişilebilir olmalıdır; sürekli sunucu hizmeti değildir. Sayfa açıkken kayıtlı akış 60 saniyede, piyasa göstergeleri 5 dakikada yenilenir.

## Editör
/yonetici içindeki HaberAI bölümü mevcut yönetici oturumunu kullanır. Başlık, özet, şehirler ve görünürlük düzenlenebilir. Kaynak URL ve yayın tarihi korunur. Düzenlenen kayıtlar sonraki otomatik toplamada ezilmez. Çakışan kaydetme 409 döner. API GET ?view=editor, PUT ve POST yönetici oturumu gerektirir. PUT/POST aynı kaynak kontrolü uygular.

## Piyasalar
TCMB gösterge döviz satış kurları: USD/TRY, EUR/TRY.
Gram altın: XAU USD/troy ons × TCMB USD/TRY ÷ 31.1034768; teorik 24 ayar TL/gram, perakende alış/satış değildir.
Brent: Yahoo Finance BZ=F vadeli referansı, USD/varil. Kaynak ve veri zamanı ekranda görünür. Kaynaklar kesildiğinde değer uydurulmaz.

## Doğrulama
12 Eylül 2026: 81 il gerçek tarayıcı fare tıklamasıyla doğrulandı; mobilde yatay taşma ve React sayfa hatası yok. Editör API yetkisiz istek 401, farklı Origin 403, kayıt çakışması 409; gizlenen haberin genel akıştan çıkarılması ve taramada editör değişikliğinin korunması doğrulandı. Test sırasında kullanılan haber özgün haline geri alındı. Üretim derlemesi ve değişen HaberAI dosyalarının ESLint/TypeScript kontrolü geçti.

Derleme doğrulamasını çalışan geliştirme sunucusundan ayrı NEXT_DIST_DIR=.local/next-validation ile çalıştırın. Aynı çıktı dizinine eşzamanlı build/dev yazmayın.
