import type { Metadata } from "next";
import { AIToolFoundationPage } from "@/components/ai-tool-foundation-page";

export const metadata: Metadata = { title: "MagazinAI — Kültür ve gündem araştırma yardımcısı", description: "Kültür, yaratıcı sektörler ve gündem başlıklarını kaynaklarıyla izlemeye hazırlanan editoryal araştırma yardımcısı.", alternates: { canonical: "/magazin-ai" }, robots: { index: false, follow: true }, openGraph: { url: "/magazin-ai" } };

export default function MagazinAIPage() {
  return <AIToolFoundationPage tool={{
    name: "MagazinAI", eyebrow: "Kültür ve gündem araştırma yardımcısı", title: "Gündemi söylentiden ayırıp kaynaklarıyla izleyin.",
    description: "MagazinAI; yaratıcı sektörler, ekran kültürü, müzik, tasarım, moda ve dijital eğilimleri güvenilir yayınlar ve resmî açıklamalar üzerinden özetlemek üzere hazırlanıyor.",
    accent: "#b15c89", promise: "Hızı doğruluğun önüne koymadan; kişilik haklarına, kaynağa ve bağlama saygılı bir gündem özeti sunmak.",
    capabilities: [
      { title: "Kaynaklı gündem", description: "Haber, açıklama ve röportajları yayıncı, tarih ve özgün bağlantısıyla birlikte düzenler." },
      { title: "Eğilim haritası", description: "Tekil olayları yaratıcı sektör, üretim biçimi ve izleyici davranışıyla ilişkilendirir." },
      { title: "Editoryal güvenlik", description: "Söylenti, özel hayat ihlali ve doğrulanmamış iddiaları yayımlanabilir içerikten ayırır." },
    ],
    steps: ["İzlenecek kültür alanını ve zaman aralığını seçin.", "Birincil açıklamaları ve güvenilir yayınları birlikte değerlendirin.", "Olayı bağlamı ve ilgili üretim ekosistemiyle özetleyin.", "Doğrulanmamış veya kişilik haklarını ihlal eden iddiaları dışarıda bırakın."],
    boundary: "MagazinAI doğrulanmamış söylenti, özel hayat verisi veya kişilere zarar verebilecek spekülatif içerik üretmez.",
  }} />;
}
