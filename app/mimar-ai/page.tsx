import type { Metadata } from "next";
import { AIToolFoundationPage } from "@/components/ai-tool-foundation-page";

export const metadata: Metadata = { title: "MimarAI — Mimari karar yardımcısı", description: "Mekân ihtiyacını, tasarım ölçütlerini, malzeme seçeneklerini ve doğrulama adımlarını düzenleyen mimari karar yardımcısı.", alternates: { canonical: "/mimar-ai" }, robots: { index: false, follow: true }, openGraph: { url: "/mimar-ai" } };

export default function MimarAIPage() {
  return <AIToolFoundationPage tool={{
    name: "MimarAI", eyebrow: "Mimari araştırma ve karar yardımcısı", title: "Mekân fikrini uygulanabilir bir tasarım özetine dönüştürün.",
    description: "MimarAI; ihtiyaçları, alanları, kullanım senaryolarını, malzeme tercihlerini ve doğrulanması gereken kuralları tek bir mimari araştırma akışında düzenlemek üzere hazırlanıyor.",
    accent: "#78a5b6", promise: "Güzel görünen bir öneriden önce ihtiyacı, ölçüyü, bağlamı ve uzman doğrulamasını görünür kılmak.",
    capabilities: [
      { title: "İhtiyaç programı", description: "Kullanıcı, alan, işlev, ilişki ve öncelikleri yapılandırılmış bir tasarım özetine dönüştürür." },
      { title: "Seçenek karşılaştırma", description: "Planlama ve malzeme seçeneklerini maliyet, bakım, erişilebilirlik ve kullanım bağlamıyla karşılaştırır." },
      { title: "Doğrulama listesi", description: "Mevzuat, taşıyıcı sistem, yangın, erişilebilirlik ve uygulama kararları için uzman kontrol noktalarını ayırır." },
    ],
    steps: ["Mekânın kullanıcılarını, amacını ve temel kısıtlarını tanımlayın.", "Alan ihtiyaçlarını ve birbiriyle ilişkili işlevleri düzenleyin.", "Alternatifleri ölçütler ve açık varsayımlarla karşılaştırın.", "Ruhsat, mühendislik ve uygulama kararlarını yetkili uzmanlarla doğrulayın."],
    boundary: "MimarAI mimari proje, ruhsat belgesi veya profesyonel onay üretmez; yetkili mimar ve mühendis değerlendirmesinin yerini almaz.",
  }} />;
}
