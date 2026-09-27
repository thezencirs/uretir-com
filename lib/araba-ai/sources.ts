export type AutomotiveSource={id:string;brand:string;origins:string[];pricePatterns:RegExp[];campaignPatterns:RegExp[];priceUrls?:string[];campaignUrls?:string[]};

export const automotiveSources:AutomotiveSource[]=[
 {id:"renault",brand:"Renault",origins:["https://www.renault.com.tr"],pricePatterns:[/fiyat/i,/price/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"dacia",brand:"Dacia",origins:["https://www.dacia.com.tr"],pricePatterns:[/fiyat/i,/price/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"toyota",brand:"Toyota",origins:["https://www.toyota.com.tr","https://turkiye.toyota.com.tr"],pricePatterns:[/fiyat-listesi/i],campaignPatterns:[/kampanya/i],priceUrls:["https://turkiye.toyota.com.tr/middle/fiyat-listesi/"],campaignUrls:["https://www.toyota.com.tr/kampanyalar"]},
 {id:"fiat",brand:"Fiat",origins:["https://www.fiat.com.tr"],pricePatterns:[/fiyat-listesi/i,/fiyatlar/i],campaignPatterns:[/kampanya/i],campaignUrls:["https://www.fiat.com.tr/kampanyalar"]},
 {id:"ford",brand:"Ford",origins:["https://www.ford.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"hyundai",brand:"Hyundai",origins:["https://www.hyundai.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"volkswagen",brand:"Volkswagen",origins:["https://binekarac.vw.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i,/firsat/i]},
 {id:"skoda",brand:"Škoda",origins:["https://www.skoda.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"seat",brand:"SEAT",origins:["https://www.seat.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"cupra",brand:"CUPRA",origins:["https://www.cupraofficial.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"peugeot",brand:"Peugeot",origins:["https://www.peugeot.com.tr","https://kampanya.peugeot.com.tr"],pricePatterns:[/fiyat-listesi/i],campaignPatterns:[/kampanya/i,/firsat/i],priceUrls:["https://kampanya.peugeot.com.tr/fiyat-listesi/"]},
 {id:"citroen",brand:"Citroën",origins:["https://www.citroen.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i],campaignUrls:["https://www.citroen.com.tr/guncel-kampanyalar/kampanyalar.html"]},
 {id:"opel",brand:"Opel",origins:["https://www.opel.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"nissan",brand:"Nissan",origins:["https://www.nissan.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"honda",brand:"Honda",origins:["https://www.honda.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"kia",brand:"Kia",origins:["https://www.kia.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"chery",brand:"Chery",origins:["https://cherytr.com"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"byd",brand:"BYD",origins:["https://www.bydauto.com.tr"],pricePatterns:[/fiyat-listesi/i],campaignPatterns:[/kampanya/i],priceUrls:["https://www.bydauto.com.tr/fiyat-listesi"],campaignUrls:["https://www.bydauto.com.tr/kampanyalar"]},
 {id:"mg",brand:"MG",origins:["https://www.mgmotor.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i]},
 {id:"bmw",brand:"BMW",origins:["https://www.bmw.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"mercedes",brand:"Mercedes-Benz",origins:["https://www.mercedes-benz.com.tr"],pricePatterns:[/fiyat/i,/price/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"audi",brand:"Audi",origins:["https://www.audi.com.tr"],pricePatterns:[/fiyat/i],campaignPatterns:[/kampanya/i,/teklif/i]},
 {id:"volvo",brand:"Volvo",origins:["https://www.volvocars.com/tr"],pricePatterns:[/fiyat/i,/price/i],campaignPatterns:[/kampanya/i,/offer/i]},
 {id:"togg",brand:"Togg",origins:["https://www.togg.com.tr"],pricePatterns:[/fiyat/i,/siparis/i],campaignPatterns:[/kampanya/i,/finans/i]},
 {id:"tesla",brand:"Tesla",origins:["https://www.tesla.com/tr_tr"],pricePatterns:[/model/i,/order/i],campaignPatterns:[/finans/i,/teslim/i]}
];
