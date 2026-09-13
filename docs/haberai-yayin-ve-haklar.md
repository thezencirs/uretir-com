# HaberAI işletim ve haklar kaydı

HaberAI, Üretir'in şehir eşleştirme, tarihli arşiv ve bülten yazılımıdır. Haber yayıncılarının metin ve fotoğraf hakları Üretir'e geçmez; haritanın mevcut MIT lisansı korunur. Bu uygulama hukuki uygunluk garantisi vermez.

## Kaynak politikası

- Yalnızca kaynak listesine eklenmiş, yayıncı tarafından sunulan HTTPS RSS adresleri okunur. Haber sayfalarının tamamı kopyalanmaz; paywall veya erişim engeli aşılmaz.
- TRT'nin `https://www.trthaber.com/sitene_ekle.html` sayfasındaki altı akış ve AA'nın `https://www.aa.com.tr/tr/teyithatti/p/rss-linkleri` sayfasındaki teyit akışı kayıtlıdır.
- Kartlar başlık, tarih, yayıncı ve özgün bağlantıdan oluşur. RSS açıklaması şehir sınıflandırması sırasında kullanılır; kopya özet ve fotoğraf yayınlanmaz.
- Her yeni kayıtta kaynak, politika adresi, inceleme zamanı ve `link-index` kullanım modu saklanır. Bu kayıt lisans verildiği anlamına gelmez. Ticari kullanım koşulları ve başlık kullanımı yayıncıyla gerektiğinde ayrıca teyit edilmelidir.
- Editör kendi metnini girebilir, yanlış şehir etiketini düzeltebilir ve kaldırma talebi için kaydı gizleyebilir. Tarayıcı editör değişikliklerini üzerine yazmaz. Gizli haberler bülten üretimine katılmaz.
- Tam metin, fotoğraf veya sosyal yeniden yayın lisansı alınırsa kapsamı ve belgesi ayrıca kaydedilmeden otomatik yayın açılmamalıdır.

## Günlük işlem

Vercel Hobby zamanlaması günde birdir: UTC 06.13; yarım saatlik güncelleme GitHub Actions iş akışının UTC her saatin 7. ve 37. dakikasındaki çalışmasından gelir. Site açıkken kayıtlı akış dakikada bir yenilenir; bu, kaynakların dakikada bir tarandığı anlamına gelmez. Arşiv yalnızca toplamanın başladığı tarihten itibaren birikir. 81 ilin haritası vardır; her ilde her gün haber bulunduğu iddia edilmez.

`haber_bulletins` tablosu bugünün şehir etiketli en fazla on haberini, özgün bağlantıları ve kanal hedefiyle tutar. Durum `awaiting_channel_connection` iken hiçbir mesaj gönderilmez. Editördeki kopyalama düğmesi manuel yayın içindir; otomatik kanal yayını değildir.

Hedef kanal: https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y

Her haber için özgün ve telifsiz Üretir SVG görsel kartı `https://www.uretir.com/api/haber-ai/share/{haberId}` adresinde üretilir; bülten metni bu kart bağlantısını içerir. Vercel Hobby tek günlük cron sınırı nedeniyle saatlik yenileme `.github/workflows/haber-ai-hourly.yml` iş akışından çalışır. İş akışının çalışması için GitHub deposunda `CRON_SECRET` Actions secret olarak tanımlanmalıdır; iş akışı her saatin 7. dakikasında `/api/cron/haber-ai` çağırır.

WhatsApp kanalına yayın için yönetici oturumu veya bu belirli kanalı destekleyen yetkili bir entegrasyon gerekir. Müşterilere mesaj gönderen Business API bağlantısı tek başına kanal gönderimi kanıtı değildir. Gönderim doğrulanmadan kaydı `sent` işaretlemeyin. İlk çalışma sırasında WhatsApp Web oturumu açık değildi.
