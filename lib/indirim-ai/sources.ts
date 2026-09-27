export type CommerceSource={id:string;name:string;origin:string;trustScore:number;productPatterns:RegExp[];sitemapCandidates?:string[]};

export const commerceSources:CommerceSource[]=[
  {id:"amazon-tr",name:"Amazon Türkiye",origin:"https://www.amazon.com.tr",trustScore:96,productPatterns:[/\/dp\//i,/\/gp\/product\//i]},
  {id:"trendyol",name:"Trendyol",origin:"https://www.trendyol.com",trustScore:94,productPatterns:[/-p-\d+/i]},
  {id:"hepsiburada",name:"Hepsiburada",origin:"https://www.hepsiburada.com",trustScore:94,productPatterns:[/-p-/i]},
  {id:"n11",name:"n11",origin:"https://www.n11.com",trustScore:90,productPatterns:[/\/urun\//i]},
  {id:"teknosa",name:"Teknosa",origin:"https://www.teknosa.com",trustScore:94,productPatterns:[/-p-\d+/i,/\/urun\//i]},
  {id:"mediamarkt",name:"MediaMarkt Türkiye",origin:"https://www.mediamarkt.com.tr",trustScore:94,productPatterns:[/\/product\//i,/\/tr\/product\//i]},
  {id:"vatan",name:"Vatan Bilgisayar",origin:"https://www.vatanbilgisayar.com",trustScore:93,productPatterns:[/\/[^/]+\.html$/i]},
  {id:"migros",name:"Migros",origin:"https://www.migros.com.tr",trustScore:93,productPatterns:[/-p-/i,/\/urun\//i]},
  {id:"carrefoursa",name:"CarrefourSA",origin:"https://www.carrefoursa.com",trustScore:93,productPatterns:[/\/p\//i,/\/product\//i]},
  {id:"boyner",name:"Boyner",origin:"https://www.boyner.com.tr",trustScore:92,productPatterns:[/-p-/i,/\/urun\//i]},
  {id:"lcw",name:"LC Waikiki",origin:"https://www.lcw.com",trustScore:92,productPatterns:[/\/urun-/i,/\/product-/i]},
  {id:"defacto",name:"DeFacto",origin:"https://www.defacto.com.tr",trustScore:92,productPatterns:[/\/product\//i,/\/urun\//i]},
  {id:"flo",name:"FLO",origin:"https://www.flo.com.tr",trustScore:92,productPatterns:[/-p-/i,/\/urun\//i]},
  {id:"koctas",name:"Koçtaş",origin:"https://www.koctas.com.tr",trustScore:93,productPatterns:[/\/p\//i,/\/urun\//i]},
  {id:"ikea",name:"IKEA Türkiye",origin:"https://www.ikea.com.tr",trustScore:94,productPatterns:[/\/urun\//i,/\/p\//i]}
];
