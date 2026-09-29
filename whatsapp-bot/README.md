# Üretir WhatsApp Kanal Motoru

Bu bot tek bir WhatsApp Web oturumu ile **HaberAI**, **FinansAI**, **PuanAI**, **İndirimAI**, **ArabaAI** ve **EvAI** kanallarını yönetir. **GüzelAI bu yayın motoruna dahil değildir.** İçeriklerin tamamı `uretir.com` API uçlarından alınır; bot içerik üretmez, yalnızca doğru kanalı doğrular ve gönderimi yapar.

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
5. Panelde altı kanal hedefinin ayrı ayrı owner/admin olarak doğrulandığını kontrol edin.

Bot 30 dakikada bir kontrol yapar. HaberAI yeni şehir haberi varsa gönderir. FinansAI ve İndirimAI değişen özetleri, PuanAI ve ArabaAI yeni doğrulanmış kayıtları, EvAI ise günlük sınırı aşmadan uygun kayıtları yayınlar.

`data/auth` ve `data/channel-state.json` oturum/teslim durumudur; Git'e eklenmez ve paylaşılmamalıdır.

> WhatsApp Web tabanlı kanal gönderimi Meta WhatsApp Cloud API değildir. WhatsApp Web tarafındaki değişiklikler kanal gönderimini etkileyebilir; uretir.com veri ve doğrulama API'leri bundan bağımsız çalışmaya devam eder.

## Yetkilendirmesi bekleyen kanallar

İndirimAI ve ArabaAI veri motorları, cron taramaları, web sayfaları ve WhatsApp-ready API çıktıları hazırdır. Kanal gönderimi bilinçli olarak ortam değişkenlerine bağlanmıştır:

- `INDIRIMAI_CHANNEL_INVITE_CODE` ve `INDIRIMAI_CHANNEL_URL`
- `ARABAAI_CHANNEL_INVITE_CODE` ve `ARABAAI_CHANNEL_URL`

Bu değerler boşken bot iki kanalı hedef listesine eklemez. Yetkilendirme tamamlanınca kod değişikliği gerekmeden yalnızca değerlerin tanımlanması ve botun yeniden başlatılması yeterlidir.

### EvAI
- Veri: `https://www.uretir.com/api/ev-ai`
- Kanal feed: `https://www.uretir.com/api/ev-ai/whatsapp`
- Tarama: `https://www.uretir.com/api/cron/ev-ai`
- Yetki: `EVAI_CHANNEL_URL`, `EVAI_CHANNEL_INVITE_CODE`
- Ticari pazar yeri adaptörleri: `EVAI_ENABLE_PARTNER_SOURCES=1` yalnızca ilgili yeniden kullanım/API izni doğrulandıktan sonra açılır.
- Yayın hedefi: günlük en fazla 10 EvAI gönderisi.
