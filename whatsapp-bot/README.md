# Üretir WhatsApp Kanal Motoru

Bu bot tek bir WhatsApp Web oturumu ile **HaberAI**, **FinansAI** ve **PuanAI** kanallarını yönetir. İçeriklerin tamamı `uretir.com` API uçlarından alınır; bot içerik üretmez, yalnızca doğru kanalı doğrular ve gönderimi yapar.

## Kanallar

- HaberAI → `https://www.uretir.com/api/haber-ai/whatsapp`
- FinansAI → `https://www.uretir.com/api/finans-ai/whatsapp`
- PuanAI → `https://www.uretir.com/api/puan-ai/whatsapp`

HaberAI mevcut claim/ack teslim güvenliğini korur. FinansAI değişen piyasa özetini, PuanAI ise yalnızca taze ve resmî kaynakla doğrulanmış kampanyaları yayınlar. PuanAI banka ve kategori tekrarını yerel teslim durumuyla sınırlar.

Her kanal gönderisinin marka katmanı `<ÜrünAI> • uretir.com` biçimindedir. Böylece WhatsApp dağıtım kanalı olur; veri, doğrulama ve detay sayfası uretir.com üzerinde kalır.

## Çalıştırma

1. Bu klasörde `npm install` çalıştırın.
2. Kök projedeki üretim ortamıyla aynı `WHATSAPP_BOT_SECRET` veya `CRON_SECRET` değerini bot ortamına tanımlayın.
3. `npm start` çalıştırın.
4. İlk kurulumda `http://127.0.0.1:3217` ekranındaki QR kodu, üç kanalın da owner/admin yetkisine sahip WhatsApp hesabıyla okutun.
5. Panelde HaberAI, FinansAI ve PuanAI hedeflerinin ayrı ayrı doğrulandığını kontrol edin.

Bot 30 dakikada bir kontrol yapar. HaberAI yeni şehir haberi varsa gönderir. FinansAI en fazla saatte bir değişen piyasa özetini paylaşır. PuanAI en fazla saatte bir, daha önce gönderilmemiş ve doğrulaması taze bir kampanya paylaşır.

`data/auth` ve `data/channel-state.json` oturum/teslim durumudur; Git'e eklenmez ve paylaşılmamalıdır.

> WhatsApp Web tabanlı kanal gönderimi Meta WhatsApp Cloud API değildir. WhatsApp Web tarafındaki değişiklikler kanal gönderimini etkileyebilir; uretir.com veri ve doğrulama API'leri bundan bağımsız çalışmaya devam eder.
