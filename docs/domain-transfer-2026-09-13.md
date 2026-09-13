# uretir.com alan adı geçişi

13 Eylül 2026 kontrolü: Verisign RDAP durumu `pending transfer`. Kayıt kuruluşu henüz Atak Domain; görünen bitiş tarihi 27 Eylül 2026. Squarespace transferinin tamamlandığı henüz doğrulanmadı.

Mevcut yetkili DNS: eu.guzelhosting.com, sg.guzelhosting.com, tr.guzelhosting.com, us.guzelhosting.com. Ana alan adı HTTPS ile www adresine yönleniyor; www 200 yanıtı veriyor. Vercel projesi `uretir-com`, GitHub deposu `thezencirs/uretir-com`.

Squarespace hesabı içinden transfer paneli de kontrol edildi: `uretir.com` için “Transfer devam ediyor” yazıyor. A, www CNAME, MX ve Google doğrulama TXT kayıtlarının aşağıdaki değerlerle eksiksiz aktarıldığı görüldü. Ayrıca Squarespace'in `_domainconnect` CNAME kaydı bulunuyor. Bu nedenle aynı kayıtları yeniden ekleme veya ad sunucusu değişikliği yapılmadı. Panel bu aşamada yalnızca genel bakış ve faturalandırma seçeneklerini sunuyor. Transfer tamamlandıktan sonra yetkili DNS ve yenilenen bitiş tarihi ayrıca doğrulanmalı.

HaberAI GitHub otomasyonundaki eksik/uyuşmayan CRON_SECRET, Vercel ve GitHub'da aynı yeni gizli değerle eşitlendi. Üretim yayını ardından 34738858447 numaralı GitHub çalışması başarılı tamamlandı. Toplayıcı altı TRT akışından 360 kayıt işledi; AA Teyit kaynağı okunamadığından veri toplama sonucu `partial`. Zamanlayıcı başarısı bütün kaynakların sağlıklı olduğu anlamına gelmez.

## Geçişte korunacak doğrulanmış kayıtlar

| Ad | Tür | Değer | TTL |
| --- | --- | --- | --- |
| @ | A | 216.198.79.1 | 14400 |
| www | CNAME | b88e23332decc9db.vercel-dns-017.com | 14400 |
| @ | TXT | google-site-verification=pZo0AyUnXiTmU5WSShFivRwv1ixNX5dDR4lorba1o0M | 14400 |
| @ | MX | Öncelik 0, uretir.com | 14400 |

Bu liste bilinen adların DNS sorgusudur, tam zone dışa aktarımı değildir. MX şu anda web sunucusuna işaret ediyor; mevcut e-posta sağlayıcısı doğrulanmadan değiştirilmemeli. Vercel'de eski `puanai.uretir.com` başka projeye bağlı ancak DNS kaydı yok; çalışan ürün adresi `https://www.uretir.com/puan-ai`.

## Uygulama sırası

1. Squarespace hesabından transfer durumunu ve aktarılan DNS kayıtlarının tamamını kontrol et. Eski DNS zone dosyasıyla karşılaştır; e-posta, DKIM, SPF, doğrulama kayıtlarını koru.
2. Yeni DNS hizmetinde kayıtlar hazır ve doğrulanmış olmadan ad sunucularını değiştirme. Transfer tamamlanana ve yeni DNS yayılana kadar Güzel Hosting DNS hizmetini kapatma.
3. Transfer tamamlandıktan sonra kayıt kuruluşunu, uzayan bitiş tarihini, yetkili DNS'i ve HTTPS'i tekrar doğrula.
4. GitHub/Vercel proje bağlantısının taşınması gerekmez. HaberAI GitHub zamanlayıcısı alan adına bağımlı olmadan `https://uretir-com.vercel.app/api/cron/haber-ai` kullanır. Vercel cron tanımları proje içinde kalır.

## Ödeme yapmadan PuanAI

PuanAI varsayılan olarak doğrulanmış kampanya kural motoruyla cevap verir. API anahtarı bulunsa bile `PUANAI_PAID_AI_ENABLED=true` açıkça verilmedikçe ücretli OpenAI isteği yapılmaz. Bu ayar için kullanıcıdan yeni ödeme onayı alınmadan ücretli mod açılmamalıdır. Hosting/veritabanı sağlayıcılarının kota ve plan koşulları ayrıca geçerlidir; sınırsız ücretsiz hizmet taahhüdü değildir.
