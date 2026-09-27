# Üretir WhatsApp AI Kanal Ağı

Ana veri ve yayın merkezi **uretir.com**'dur.

## Dahil olan kanallar
- HaberAI
- FinansAI
- PuanAI
- İndirimAI
- ArabaAI
- EvAI

## Hariç tutulan kanal
- GüzelAI

## İlke
Veri ve doğrulama uretir.com API'lerinde yapılır. WhatsApp botu veri üretmez; yalnızca yetkilendirilmiş kanalı doğrular, uretir.com'dan hazır içeriği çeker ve kanala yollar.

## Yetkilendirme bekleyen ürünler
İndirimAI, ArabaAI ve EvAI için kanal URL/invite-code değerleri ortam değişkenlerine girilmeden bot hedefi oluşmaz.

EvAI için ticari ilan platformu adaptörleri ayrıca `EVAI_ENABLE_PARTNER_SOURCES=0` ile kapalıdır. Emlakjet, sahibinden.com, Hepsiemlak ve Zingat yeniden kullanım/API izni doğrulandığında bu bayrak açılır. Kamu kaynakları ayrı adaptörlerle çalışır ve robots.txt engelinde fail-closed davranır.

## EvAI yayın standardı
- günde en fazla 10 gönderi
- kaynak ve ilan tipi çeşitliliği
- yerel m² medyanı/fiyat düşüşü/güncellik bağlamı
- kamu/icra ilanında muhammen bedeli piyasa fiyatı gibi sunmama
- her gönderide uretir.com/ev-ai ve asıl kaynak bağlantısı
