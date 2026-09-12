import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCampaignCatalog } from "@/lib/puan-ai/catalog-service";
import { evaluateCampaigns, normalizeTurkish } from "@/lib/puan-ai/rule-engine";

export const dynamic = "force-dynamic";
const schema = z.object({ cards: z.string().min(2).max(200), category: z.enum(["Akaryakıt", "Market", "Eğitim", "Elektronik", "Giyim", "Seyahat", "Sağlık", "Restoran", "Sigorta"]), amount: z.coerce.number().positive().max(10000000).optional(), preference: z.enum(["puan", "taksit"]).default("puan") });
export async function GET(request: NextRequest) {
  const input = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!input.success) return NextResponse.json({error:"Kart adlarını, kategoriyi ve geçerli tutarı kontrol edin."},{status:400});
  const names = [...new Set(input.data.cards.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean))];
  if (names.length>8 || names.some(n=>/\d{6}/.test(n))) return NextResponse.json({error:"En fazla 8 kart adı girin. Kart numarası girmeyin."},{status:400});
  try {
    const catalog = await getCampaignCatalog();
    const results = names.map(name=>{
      const key=normalizeTurkish(name);
      const owned=catalog.filter(c=>c.cards.some(card=>normalizeTurkish(card.name).includes(key)));
      const query=`${input.data.category} ${input.data.amount??""} ${input.data.amount?"TL":""} ${input.data.preference==="taksit"?"taksit":""}`;
      return {card:name,campaigns:evaluateCampaigns(owned,query)};
    });
    return NextResponse.json({results,checkedAt:new Date().toISOString(),coverage:"Yalnızca kayıtlı ve süresi geçmemiş doğrulanmış kampanyalar karşılaştırılır. Tüm bankaları kapsamaz."},{headers:{"Cache-Control":"no-store"}});
  } catch {return NextResponse.json({error:"Kampanya verisine ulaşılamadı. Yeniden deneyin."},{status:503});}
}
