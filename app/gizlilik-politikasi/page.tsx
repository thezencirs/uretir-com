import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve Çerez Aydınlatma Metni",
  description:
    "Üretir gizlilik politikası, KVKK aydınlatma metni, çerez kullanımı ve Google AdSense / üçüncü taraf reklam çerezleri hakkında bilgiler.",
  alternates: { canonical: "/gizlilik-politikasi" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Gizlilik Politikası ve Çerez Aydınlatma Metni — Üretir",
    description:
      "Üretir gizlilik politikası, KVKK aydınlatma metni, çerez kullanımı ve Google AdSense / üçüncü taraf reklam çerezleri hakkında bilgiler.",
    url: "/gizlilik-politikasi",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function PrivacyPage() {
  return (
    <div className="page-reveal section-wrap max-w-5xl py-14 md:py-24">
      <p className="rule-label">Üretir / Yasal &amp; KVKK</p>
      <h1 className="mt-7 display-lg">
        Gizlilik
        <br />
        <span className="italic text-[#769d32]">politikası.</span>
      </h1>
      <div className="mt-14 grid gap-10 border-t hairline pt-8 md:grid-cols-[.45fr_1fr]">
        <div>
          <p className="eyebrow">Kısa, şeffaf ve açık</p>
          <p className="mt-5 text-xs leading-5 text-muted">
            Son güncelleme
            <br />5 Kasım 2026
          </p>
        </div>
        <div className="grid gap-10 text-[16px] leading-8 text-muted">
          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">Verileriniz ve Kart Güvenliği</h2>
            <p className="mt-4">
              Üretir, bülten veya iletişim formları üzerinden hassas kişisel veri kaydetmez. PuanAI sohbetleri, geçmişi
              aynı tarayıcıya sunabilmek için rastgele üretilmiş anonim bir oturum anahtarıyla PostgreSQL veritabanında
              saklanır. <strong>Kesinlikle kredi kartı numarası, CVV, banka parolası, T.C. kimlik numarası veya hesap
              ekstresi istenmez ve toplanmaz</strong>; PuanAI yalnızca resmî banka kampanya koşullarını açıklar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">
              Google AdSense ve Üçüncü Taraf Reklam Çerezleri
            </h2>
            <p className="mt-4">
              Bu web sitesinde sunulan ücretsiz yapay zekâ ve veri araştırma araçlarının sürdürülebilirliğini sağlamak
              amacıyla <strong>Google AdSense</strong> reklam servisleri kullanılabilir. Google dahil üçüncü taraf
              tedarikçiler, kullanıcıların bu web sitesine veya internetteki diğer web sitelerine yaptıkları önceki
              ziyaretlere dayalı olarak reklam yayınlamak için çerezleri (örneğin <strong>DoubleClick DART çerezi</strong>)
              kullanır.
            </p>
            <p className="mt-4">
              Google&apos;ın reklam çerezlerini kullanması, Google ve iş ortaklarının sitemizi ve/veya internetteki diğer
              siteleri ziyaretlerinize dayalı olarak size uygun reklamlar sunmasına olanak tanır. Kullanıcılar,{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--foreground)] underline underline-offset-4"
              >
                Google Reklam Ayarları (adssettings.google.com)
              </a>{" "}
              sayfasını ziyaret ederek kişiselleştirilmiş reklamcılığı istedikleri zaman devre dışı bırakabilir. Ayrıca{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--foreground)] underline underline-offset-4"
              >
                aboutads.info
              </a>{" "}
              adresini ziyaret ederek üçüncü taraf tedarikçilerin kişiselleştirilmiş reklamcılık için çerez
              kullanımını kapatabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">Üretir ID ve Topluluk</h2>
            <p className="mt-4">
              Üretir ID kullanıcı adı, görünen ad, tek yönlü türetilmiş şifre ve kurtarma kodu özetini saklar; üyelikte
              e-posta adresi istenmez. Şifre ve kurtarma kodunun açık hali veritabanına kaydedilmez. Girişim
              bilgileriniz, yazılarınız ve yorumlarınız PostgreSQL veritabanında tutulur. Taslak ve incelemedeki
              içerikleri yalnızca siz ve yöneticiler görebilir. Yayın onayı verilen içerik ve görünen adınız internette
              herkese açık olur.
            </p>
            <p className="mt-4">
              Üretir ID oturumu, yalnızca sunucunun okuyabildiği teknik çerezle 7 gün sürer. Hesap kurtarma bütün
              oturumları kapatır. Hesabım alanından içeriğinizi veya şifrenizle hesabınızı silebilirsiniz; hesaba bağlı
              girişim, yazı ve yorum kayıtları kaldırılır.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">Çerezler ve Analitik</h2>
            <p className="mt-4">
              PuanAI anonim sohbet geçmişini ayırt etmek için yalnızca sunucunun okuyabildiği, SameSite=Strict teknik
              çerez kullanır. Tema tercihiniz tarayıcınızda yerel olarak saklanır. Site trafiğini ve sayfa performansını
              anonim olarak ölçümlemek amacıyla Google Analytics 4 (GA4) ve Google Search Console doğrulama araçları
              kullanılabilir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">Yapay Zekâ Sağlayıcısı</h2>
            <p className="mt-4">
              PuanAI, yapılandırıldığı ortamlarda yanıt açıklamasını üretmek için kullanıcı sorusunu ve yalnızca kural
              motorundan geçen doğrulanmış kampanya özetlerini OpenAI Responses API&apos;ye gönderir. Model kampanya
              veritabanı değildir ve kampanya seçme veya doğrulama yetkisine sahip değildir.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-[color:var(--foreground)]">Haklarınız ve İletişim</h2>
            <p className="mt-4">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınız, sorularınız veya veri silme
              talepleriniz için{" "}
              <a
                href="mailto:merhaba@uretir.com"
                className="text-[color:var(--foreground)] underline underline-offset-4"
              >
                merhaba@uretir.com
              </a>{" "}
              adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
