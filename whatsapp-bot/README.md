# Üretir HaberAI WhatsApp Kanal Botu

Bu bot, `uretir.com/api/haber-ai/whatsapp` üzerinden hazırlanmış ve henüz gönderilmemiş bülteni alır. Kanal yöneticisi hesabı WhatsApp Web QR kodunu bir kez okuttuktan sonra bot, `CHANNEL_NAME` ile eşleşen WhatsApp Kanalına gönderir ve yalnızca başarılı gönderimden sonra bülteni `sent` olarak işaretler. Site kaynakları yarım saatte bir yenilenir; yeni şehir haberi bulunduğunda bülten tekrar gönderilebilir, aynı içerik değişmediyse tekrar gönderilmez.

## Kurulum

1. Bu klasörde `npm install` çalıştırın.
2. `.env.example` dosyasını `.env` olarak kopyalayın. `CRON_SECRET`, Vercel/GitHub Actions’taki aynı değer olmalıdır.
3. `npm start` çalıştırıp QR kodu kanal yöneticisi hesabıyla okutun.
4. Kanal adının WhatsApp’ta tam olarak `HaberAI` olduğundan emin olun; farklıysa `CHANNEL_NAME` değerini değiştirin.

`data/auth` oturum erişimi içerir; paylaşmayın ve Git’e eklemeyin. Bot ilk gönderimi yaptıktan sonra durumu panelden doğrulayın. WhatsApp Web tabanlı kanal gönderimi, Meta’nın resmi Cloud API’si değildir; WhatsApp tarafındaki değişikliklerle çalışması etkilenebilir.
