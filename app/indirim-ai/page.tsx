import type { Metadata } from "next";
import { AIToolFoundationPage } from "@/components/ai-tool-foundation-page";

export const metadata: Metadata = { title: "İndirimAI — İndirim karşılaştırma yardımcısı", description: "İndirimleri gerçek toplam maliyet, koşullar, kaynak ve güncellik bilgisiyle karşılaştırmaya hazırlanan karar yardımcısı.", alternates: { canonical: "/indirim-ai" }, robots: { index: false, follow: true }, openGraph: { url: "/indirim-ai" } };

export default function IndirimAIPage() {
  return <AIToolFoundationPage tool={{
    name: "İndirimAI", eyebrow: "İndirim ve fırsat karşılaştırma yardımcısı", title: "Etiketteki indirimi değil, gerçek avantajı karşılaştırın.",
    description: "İndirimAI; fiyat geçmişi, kupon koşulları, üyelik gereksinimleri, kargo ve ödeme avantajlarını tek bir açıklanabilir karşılaştırmada birleştirmek üzere hazırlanıyor.",
    accent: "#d97835", promise: "Yüzde işaretini değil, ödeyeceğiniz toplam tutarı ve fırsatın geçerli olduğu koşulları anlatmak.",
    capabilities: [
      { title: "Toplam maliyet", description: "Ürün fiyatını kargo, kupon, sepet eşiği, üyelik ve ödeme koşullarıyla birlikte ele alır." },
      { title: "Kaynak ve güncellik", description: "Her indirimin resmî bağlantısını, kontrol zamanını ve geçerlilik aralığını görünür kılar." },
      { title: "Uygunluk kontrolü", description: "Kampanyanın kullanıcı, ürün, mağaza ve ödeme yöntemi koşullarını sonuçtan önce değerlendirir." },
    ],
    steps: ["Ürün, mağaza ve satın alma zamanını belirleyin.", "İndirim, kupon ve ödeme kampanyalarının bütün koşullarını toplayın.", "Kargo ve üyelik dâhil net ödeme tutarını karşılaştırın.", "Satın almadan hemen önce fırsatı resmî kaynağında yeniden doğrulayın."],
    boundary: "Canlı ve doğrulanmış kaynak bağlantısı kurulana kadar gerçek indirim veya satın alma önerisi gösterilmez.",
  }} />;
}
