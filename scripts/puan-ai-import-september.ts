import "dotenv/config";
import { getPrisma } from "../lib/puan-ai/db";
import { verifyCampaignUrl } from "../lib/puan-ai/source-verifier";

// Reviewed against the publishers' September 2026 terms. Never roll dates forward.
const entries = [
 {slug:"bankkart-akaryakit-eylul-2026",url:"https://www.bankkart.com.tr/kampanyalar/akaryakit/akaryakit-harcamalariniza-400-tl-jest-lira",bankSlug:"ziraat-bankasi",bank:"Ziraat Bankası",officialName:"T.C. Ziraat Bankası A.Ş.",website:"https://www.ziraatbank.com.tr",program:"Bankkart",cards:["Bireysel Bankkart"],category:"Akaryakıt",aliases:["benzin","motorin","otogaz","yakıt"],title:"Dört farklı günde akaryakıta 400 TL Jest Lira",summary:"Her biri en az 1.500 TL olan dört farklı gündeki uygun işlem sonrası 400 TL Jest Lira. Tek alışveriş ödülü değildir.",minimum:1500,reward:400,purchases:4,installments:[] as number[],conditions:["Bankkart kredi kartı özelliğiyle anlaşmalı istasyonda Bankkart POS kullanılmalı; Bankkart Mobil veya site üzerinden katılım gerekir.","Aynı gün yalnızca ilk uygun işlem sayılır. Ödül 5 Ekim 2026 tarihinde yüklenir.","Bankkart Jest, Prestij ve Genç kredi kartları dahildir. Başak, Ticari, Business ve Jest Ücretsiz kartlar hariçtir.","İptal, iade ve Jest Lira kullanılarak yapılan işlemler hariçtir. Ödül nakit değil, kullanım koşulları olan Jest Liradır."]},
 {slug:"maximum-egitim-eylul-2026",url:"https://www.maximum.com.tr/kampanyalar/egitim-odemelerinize-ilave-taksit-firsati",bankSlug:"is-bankasi",bank:"İş Bankası",officialName:"Türkiye İş Bankası A.Ş.",website:"https://www.isbank.com.tr",program:"Maximum",cards:["Maximum","Maximiles","Privia"],category:"Eğitim",aliases:["okul","eğitim kurumu"],title:"Seçili eğitim kurumlarında ilave 3 taksit",summary:"Seçili Maximum anlaşmalı eğitim kurumlarında 2–9 taksitli işleme, POS üzerinde seçilmesi koşuluyla 3 ilave taksit; toplam 5–12 taksit.",minimum:0,reward:0,purchases:1,installments:[5,6,7,8,9,10,11,12],conditions:["Maximum özellikli POS ve bankanın yayımladığı anlaşmalı eğitim kurumu listesi geçerlidir.","İşlem anında üye işyeri ilave taksiti seçmelidir. Sonradan otomatik eklenmez; başlangıç taksiti 2–9 olmalıdır.","İş Bankası Maximum, Maximiles ve Privia özellikli bireysel ve ticari kredi kartları dahildir.","Aidatsız, Bankamatik, MaxiPara ve Nays kartlar; puanla ödeme, ödeme kuruluşu işlemleri, iptal ve iadeler hariçtir."]},
];
const prisma=getPrisma();
try {
 for(const e of entries){
  const v=await verifyCampaignUrl(e.url);
  if(v.status!=="VERIFIED"||!v.fingerprint||!v.validFrom||v.validUntil!=="2026-09-30T20:59:59.000Z"||!v.evidence.cardPrograms.includes(e.program)||(e.reward&&!v.evidence.monetaryAmounts.includes(e.reward)))throw Error("Kaynak koşulları değişmiş veya doğrulanamadı: "+e.slug);
  await prisma.$transaction(async tx=>{
   const bank=await tx.bank.upsert({where:{slug:e.bankSlug},update:{},create:{slug:e.bankSlug,name:e.bank,officialName:e.officialName,shortName:e.bank,websiteUrl:e.website,color:"#385d45"}});
   const category=await tx.merchantCategory.upsert({where:{slug:e.category==="Eğitim"?"egitim":"akaryakit"},update:{},create:{slug:e.category==="Eğitim"?"egitim":"akaryakit",name:e.category,aliases:e.aliases}});
   const reward=e.reward?await tx.rewardType.findUniqueOrThrow({where:{slug:"jest-lira"}}):null;
   const record={bankId:bank.id,merchantCategoryId:category.id,rewardTypeId:reward?.id??null,title:e.title,description:e.conditions.join(" "),benefitSummary:e.summary,startDate:new Date(v.validFrom!),endDate:new Date(v.validUntil!),status:"ACTIVE" as const,published:true};
   const campaign=await tx.campaign.upsert({where:{slug:e.slug},update:record,create:{slug:e.slug,...record}});
   await tx.campaignCard.deleteMany({where:{campaignId:campaign.id}});
   for(const name of e.cards){const slug=name==="Bireysel Bankkart"?"bankkart-kredi-karti":name.toLowerCase()+"-kredi-karti";const card=await tx.card.upsert({where:{slug},update:{},create:{slug,bankId:bank.id,name,network:"OTHER",rewardProgram:e.program}});await tx.campaignCard.create({data:{campaignId:campaign.id,cardId:card.id}});}
   await tx.campaignRule.deleteMany({where:{campaignId:campaign.id}});
   await tx.campaignRule.createMany({data:e.conditions.map((description,priority)=>({campaignId:campaign.id,kind:"ELIGIBILITY" as const,description,priority}))});
   if(e.minimum)await tx.campaignRule.create({data:{campaignId:campaign.id,kind:"MIN_SPEND",operator:"GTE",numericValue:e.minimum,description:"Her uygun işlem en az 1.500 TL olmalıdır."}});
   if(e.reward)await tx.campaignRule.create({data:{campaignId:campaign.id,kind:"REWARD_AMOUNT",numericValue:e.reward,description:"Dört farklı gündeki uygun alışveriş sonrası toplam 400 TL Jest Lira."}});
   if(e.purchases>1)await tx.campaignRule.create({data:{campaignId:campaign.id,kind:"REQUIRED_PURCHASE_COUNT",operator:"GTE",numericValue:e.purchases,description:"Dört farklı günde ayrı ayrı 1.500 TL ve üzeri işlem gerekir."}});
   await tx.installment.deleteMany({where:{campaignId:campaign.id}});
   if(e.installments.length)await tx.installment.createMany({data:e.installments.map(count=>({campaignId:campaign.id,count,feeFree:false,productScope:"Seçili anlaşmalı eğitim kurumları",notes:`Başlangıçta ${count-3} taksit + işlem anında POS üzerinden 3 ilave taksit. Ücret ve fiyat koşullarını kurumdan kontrol edin.`}))});
   const sourceData={bankId:bank.id,title:v.title??e.title,publisher:e.program,fetchedAt:new Date(v.fetchedAt),fingerprint:v.fingerprint!,sourceKind:"OFFICIAL_CARD_PROGRAM" as const,health:"ONLINE" as const,trustScore:100,active:true};
   const source=await tx.officialSource.upsert({where:{campaignId_url:{campaignId:campaign.id,url:e.url}},update:sourceData,create:{campaignId:campaign.id,url:e.url,...sourceData}});
   await tx.verificationLog.create({data:{campaignId:campaign.id,officialSourceId:source.id,status:"VERIFIED",checkedAt:new Date(v.fetchedAt),nextCheckAt:new Date(Date.now()+6*3600000),checker:"editor:september-source-review",summary:"Eylül 2026 kaynak koşulları incelendi; işlem sayısı, hariç kartlar ve POS koşulları kaydedildi.",fingerprint:v.fingerprint!}});
  });
  console.log(JSON.stringify({imported:e.slug,verifiedAt:v.fetchedAt}));
 }
}finally{await prisma.$disconnect();}
