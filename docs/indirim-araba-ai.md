# İndirimAI ve ArabaAI veri sistemleri

## Ortak mimari

Her iki ürün de uretir.com'u veri, doğrulama ve yayın içeriği kaynağı olarak kullanır. GitHub Actions yalnızca zamanlayıcıdır; Vercel/Next.js API uçlarını çağırır. WhatsApp botu veri üretmez.

```text
Resmî / güvenilir web kaynakları
        ↓
robots.txt kontrollü kaynak tarayıcı
        ↓
uretir.com normalizasyon + PostgreSQL tarihçe
        ↓
analiz API'leri
        ↓
web arayüzü + WhatsApp-ready feed
        ↓
(yetki verilirse) ortak WhatsApp Web kanal motoru
```

## İndirimAI

Amaç, mağazanın kendi “indirim” etiketini tekrar etmek değil; gözlenen fiyat geçmişinden gerçek dipleri belirlemektir.

- Kaynak registry'si büyük pazaryerleri ile teknoloji, market, giyim, ev, kitap, kozmetik ve spor perakendecilerini kapsar.
- Kaynağa erişmeden önce robots.txt kontrol edilir. Erişim belirsiz veya kapalıysa kaynak atlanır; koruma aşılmaz.
- Ürünlerde JSON-LD Product/Offer verisi tercih edilir.
- GTIN varsa mağazalar arası aynı ürün GTIN ile eşlenir; yoksa normalize marka+ürün adı parmak izi kullanılır.
- Her fiyat gözlemi kaynak URL, zaman, mağaza ve güven puanıyla saklanır.
- 30/90/360 günlük dip etiketi ancak ilgili pencereye yetecek kadar gerçek gözlem geçmişi oluştuğunda verilir.
- İlk dönemde kısa tarihçe “takip dönemi dibi” olarak ayrı tutulur ve 30 günlük dip diye sunulmaz.
- WhatsApp feed yalnızca yeterli geçmişi olan gerçek dipleri yayınlar.

Ana uçlar:
- `/api/indirim-ai`
- `/api/cron/indirim-ai`
- `/api/indirim-ai/whatsapp`
- `/indirim-ai`

## ArabaAI

Amaç, Türkiye'deki sıfır araç fiyat ve kampanya bilgisini resmî marka kaynaklarından tarihçeli biçimde izlemektir.

- Marka registry'si Renault, Dacia, Toyota, Fiat, Ford, Hyundai, Volkswagen, Škoda, SEAT, CUPRA, Peugeot, Citroën, Opel, Nissan, Honda, Kia, Chery, BYD, MG, BMW, Mercedes-Benz, Audi, Volvo, Togg ve Tesla kaynaklarını hedefler.
- Resmî fiyat listelerinde tablo/structured-data fiyatları ayrıştırılır.
- Model/versiyon fiyatı her taramada tarih damgasıyla saklanır; önceki gözlemden değişim hesaplanabilir.
- Kampanyalar ayrı tarihçe tablosunda saklanır. WhatsApp feed için son tarihi açıkça belirlenebilen ve halen geçerli kayıtlar tercih edilir.
- Kaynak sayfa tarih vermiyorsa kampanya veritabanında tutulabilir ancak “aktif tarihli kampanya” olarak kesin biçimde yayınlanmaz.
- Kaynak robots.txt ile taramayı kapatırsa kaynak otomatik atlanır.

Ana uçlar:
- `/api/araba-ai`
- `/api/cron/araba-ai`
- `/api/araba-ai/whatsapp`
- `/araba-ai`

## Zamanlama

GitHub Actions `.github/workflows/indirim-araba-ai-refresh.yml`:
- İndirimAI: 6 saatte bir, kaynakları döndürerek.
- ArabaAI: 4 saatte bir, marka gruplarını döndürerek.

Bu yöntem Vercel Cron kotasına bağımlılığı azaltır ve mevcut HaberAI modeline uyar.

## Yetkilendirme sonrası yapılacak tek işler

1. İndirimAI ve ArabaAI WhatsApp kanallarını oluşturun.
2. Kanal yöneticisi hesabının owner/admin yetkisini doğrulayın.
3. Kanal URL ve invite code değerlerini ortam değişkenlerine girin.
4. Ortak WhatsApp botunu yeniden başlatın.
5. İlk gönderiyi kanalda manuel gözle doğrulayın.

Veri toplama ve web ürünleri kanal yetkilendirmesinden bağımsızdır.
