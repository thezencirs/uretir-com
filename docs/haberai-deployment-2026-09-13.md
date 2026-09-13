# HaberAI dağıtımı

WhatsApp köprüsü GET ile sadece önizleme döndürür; POST claim en fazla beş yeni, bugüne ait şehir haberini atomik olarak ayırır. POST ack mesaj kimliğiyle gönderimi kaydeder. Sonucu belirsiz gönderimler yeniden gönderilmez ve inceleme gerektirir. Haber başına kalıcı kayıt `haber_deliveries` tablosundadır.

Bot hedefi kanal adıyla değil `0029VbDk4gHGpLHXkGseaf3Y` davet koduyla doğrular ve yazma yetkisini kontrol eder. Bot 30 dakikada bir kaynakları yeniler ve yeni haberleri yayınlar. GitHub iş akışı ek kaynak yenileme yoludur; 07/37 zamanlaması kuyruk yoğunluğunda gecikebilir.

Yerel botun WhatsApp oturumu ayrı eşleştirilir. `whatsapp-bot` klasöründen `npm start` kullanılır; CRON_SECRET yerel üretim ortam dosyasından okunur, loglanmaz. Bilgisayar açık ve bot çalışıyor olmalıdır. Başarı yalnızca canlı API ve gerçek mesaj kimliğiyle doğrulanır; deployment tek başına WhatsApp bağlantısı değildir.
