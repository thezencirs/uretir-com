type SeoExplainerKey="haber-ai"|"finans-ai"|"indirim-ai"|"araba-ai"|"ev-ai"|"harita"|"kesfet";

const copy:Record<SeoExplainerKey,{title:string;lead:string;body:string;points:string[]}>={
  "haber-ai":{
    title:"HaberAI nasıl çalışır?",
    lead:"HaberAI, Türkiye’deki güncel gelişmeleri şehir ve konu bağlamında tek ekranda toplar. Amaç yalnızca hızlı bir başlık akışı sunmak değil; kaynağı, yayın zamanını ve haberin hangi bölgeyle ilişkili olduğunu görünür tutmaktır.",
    body:"Haritadaki ve listedeki kayıtlar kaynak bağlantılarıyla birlikte gösterilir. İçerikler bilgi amaçlıdır; kullanıcı önemli bir karar vermeden önce özgün kaynağı açıp son güncelleme zamanını kontrol edebilir.",
    points:["Şehir ve konu bazlı keşif","Kaynak ve zaman bilgisi","Hızlı özet + özgün kaynağa geçiş"]
  },
  "finans-ai":{
    title:"FinansAI neyi gösterir?",
    lead:"FinansAI; döviz, değerli metaller, kripto, emtia ve piyasa göstergelerini tek araştırma ekranında karşılaştırmak için tasarlanır. Her veri noktasında fiyat kadar veri zamanı ve kaynak bağlamı da önemlidir.",
    body:"Gösterilen değerler yatırım tavsiyesi değildir. Farklı piyasaların işlem saatleri ve veri gecikmeleri değişebildiği için kullanıcı, karar öncesinde ilgili resmî veya birincil piyasa kaynağını ayrıca doğrulayabilir.",
    points:["Kaynaklı piyasa verisi","Veri zamanı görünürlüğü","Farklı varlıkları tek ekranda karşılaştırma"]
  },
  "indirim-ai":{
    title:"İndirimAI fiyatı nasıl değerlendirir?",
    lead:"İndirimAI bir ürünün yalnız bugünkü etiketine bakmaz; oluşan fiyat gözlemlerini 30, 90 ve 360 günlük dönemlerle karşılaştırır. Yeterli geçmiş oluşmadan bir fiyatı “dönem dibi” olarak etiketlemez.",
    body:"Bu yaklaşım, kısa süreli kampanya mesajlarıyla gerçek fiyat geçmişini birbirinden ayırmaya yardımcı olur. Ürün kartında mağaza, son gözlenen fiyat, geçmiş kapsamı ve kaynak bağlantısı birlikte gösterilir.",
    points:["Gerçek fiyat geçmişi","Yeterli gözlem olmadan dip etiketi yok","Mağaza ve kaynak bağlantısı"]
  },
  "araba-ai":{
    title:"ArabaAI ikinci el araştırmasını nasıl kolaylaştırır?",
    lead:"ArabaAI, araç ilanlarını harita ve tablo üzerinde incelerken ilan fiyatını mümkün olduğunda resmî sıfır araç fiyatı ve Üretir’deki benzer ikinci el ilan gözlemleriyle birlikte gösterir.",
    body:"Üretir ID kullanan satıcılar ilan yayınlayabilir; alıcılar favoriye ekleyip site içinden mesaj gönderebilir. Fiyat referansları ekspertiz yerine geçmez ve fiziksel araç kontrolü yapılmadan satın alma kararı verilmemelidir.",
    points:["Haritalı ikinci el ilan keşfi","Sıfır araç ve ikinci el fiyat referansı","Üretir ID ile ilan + özel mesajlaşma"]
  },
  "ev-ai":{
    title:"EvAI ilanları nasıl değerlendirir?",
    lead:"EvAI; konut, arsa ve kaynaklı taşınmaz kayıtlarını harita ile tabloyu birlikte kullanarak keşfetmeyi sağlar. İlan fiyatı, yeterli gözlem varsa bölgesel metrekare referansıyla birlikte okunabilir.",
    body:"Üretir ID kullanan satıcılar ilanlarını fotoğraf ve konumla incelemeye gönderebilir; alıcılar favoriye kaydedip site içinde mesajlaşabilir. Gösterilen referanslar resmî ekspertiz veya tapu doğrulaması değildir.",
    points:["Harita + tablo aynı filtreyi kullanır","Yerel fiyat ve m² referansı","Alıcı ve satıcı arasında site içi mesajlaşma"]
  },
  "harita":{
    title:"Üretir Harita neyi gösterir?",
    lead:"Üretir Harita, Türkiye’de geliştirilen ürünleri ve üretici ekipleri coğrafi bağlamda keşfetmek için hazırlanır. Harita yalnızca konum göstermek için değil; ürün, şehir ve üretici ilişkisini anlaşılır hale getirmek için kullanılır.",
    body:"Kayıtlardaki kaynak bağlantıları üreticinin veya ürünün kendi sayfasına yönlendirir. Konum bilgisi ekip veya üretim bağlantısını anlatır; şirket sahipliği ya da hukuki merkez iddiası olarak yorumlanmamalıdır.",
    points:["Şehir bazlı ürün keşfi","Üretici ve ürün ilişkisi","Kaynak bağlantılarıyla doğrulama"]
  },
  "kesfet":{
    title:"Keşfet bölümünde ne bulursun?",
    lead:"Keşfet; Türkiye’den uygulama, oyun ve dijital araçları ihtiyaca göre taramak için hazırlanmış ürün kataloğudur. Amaç uzun listeler yerine görev, kategori ve üretici bağlamını birlikte göstermektir.",
    body:"Her ürün kaydı mümkün olduğunda resmî ürün veya üretici kaynağıyla eşleştirilir. Kullanıcı ayrıntı sayfasından ürünün ne yaptığını, hangi ekip tarafından geliştirildiğini ve resmî bağlantılarını görebilir.",
    points:["İhtiyaca göre ürün keşfi","Kaynaklı üretici bilgisi","Harita ve ürün kataloğu birlikte"]
  }
};

export function SeoExplainer({slug}:{slug:SeoExplainerKey}){
  const item=copy[slug];
  return <section className="section-wrap seo-explainer" aria-labelledby={"seo-"+slug}>
    <p className="rule-label">Nasıl çalışır?</p>
    <h2 id={"seo-"+slug}>{item.title}</h2>
    <div className="seo-explainer-copy"><p>{item.lead}</p><p>{item.body}</p></div>
    <ul>{item.points.map(point=><li key={point}>{point}</li>)}</ul>
  </section>;
}
