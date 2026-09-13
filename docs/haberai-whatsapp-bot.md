# HaberAI WhatsApp botu

`turkiye-haber-botu.zip` içindeki bot, Üretir HaberAI kanalına bağlanacak şekilde kullanılabilir. Paket Windows üzerinde yerel çalışır; QR ile kanal yöneticisi hesabı eşleştirilmeden gerçek gönderim yapmaz. Sunucusuz Vercel fonksiyonu içinde WhatsApp Web oturumu çalıştırmak yerine bot ayrı bir bilgisayarda çalışır ve HaberAI web uygulaması aynı doğrulanmış haber verisini sunar.

## Kanal ve kaynak ayarı

`config.json` içindeki `channelUrl` şu olmalıdır:

`https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y`

Akışlar TRT Haber Türkiye, gündem ve ekonomi RSS adresleridir. Bot yalnızca başlıkta açıkça geçen il adlarını etiketler; tüm 81 ilin eksiksiz kapsandığını varsaymaz. Kart olay fotoğrafı değildir; başlık, şehir etiketi, tarih, kaynak ve özgün haber bağlantısını içerir.

## İlk çalıştırma

1. Zip'i ayrı bir klasöre çıkarın, `BASLAT.bat` dosyasını çalıştırın.
2. Panelde çıkan QR kodu kanal yöneticisi WhatsApp hesabından okutun.
3. Panelde kanalın **HaberAI** olduğu ve hesabın owner/admin yazma yetkisi görünmeden yayını başlatmayın.
4. İlk görsel gönderiyi kanalda elle kontrol edin. Bot belirsiz gönderimde duraklar ve aynı URL'yi tekrar göndermez.

Botun `data/auth` klasörü oturum erişimi içerir; Git'e veya başka bir kişiye göndermeyin. WhatsApp Web kütüphanesi resmî WhatsApp API'si değildir; kanal erişimi değişirse gönderim durabilir.

## Web akışıyla ilişki

HaberAI web tarafı saatlik kaynak taraması, şehir haritası, tarih arşivi ve PNG paylaşım kartını `/api/haber-ai/share/{id}` ile sağlar. Yerel bot bu kartı değil, kendi güvenli başlıklı kartını kullanır; böylece kaynak görselleri kopyalanmaz. Aynı URL'nin yeniden gönderilmemesi botun yerel `data/state.json` kaydında tutulur.

PuanAI için kanal adresi ayrıdır: `https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H`.
