import {z} from "zod";
const image=z.string().max(460_000).refine(v=>/^data:image\/(webp|jpeg|png);base64,/.test(v),"Görsel formatı geçersiz.");
const base=z.object({
 id:z.string().uuid().optional(),version:z.number().int().positive().optional(),kind:z.enum(["property","vehicle"]),submit:z.boolean(),
 title:z.string().trim().min(8).max(120),description:z.string().trim().min(40).max(4000),
 price:z.number().positive().max(1_000_000_000),city:z.string().trim().min(2).max(60),district:z.string().trim().min(2).max(80),neighborhood:z.string().trim().max(100).default(""),
 latitude:z.number().min(35).max(43),longitude:z.number().min(25).max(46),
 sellerRole:z.enum(["owner","dealer","agent"]),contactMode:z.enum(["secure_request","profile"]).default("secure_request"),
 images:z.array(image).max(3),verificationImage:image.nullable().optional(),
});
const propertyAttrs=z.object({listingType:z.enum(["Satılık","Kiralık"]),propertyType:z.enum(["Konut","Arsa","İş yeri"]),rooms:z.string().trim().max(30),grossM2:z.number().positive().max(100000),netM2:z.number().positive().max(100000).nullable().optional()});
const vehicleAttrs=z.object({brand:z.string().trim().min(2).max(50),model:z.string().trim().min(1).max(80),trim:z.string().trim().max(100).default(""),modelYear:z.number().int().min(1950).max(new Date().getFullYear()+1),mileage:z.number().int().min(0).max(2_000_000),fuel:z.string().trim().min(2).max(30),transmission:z.string().trim().min(2).max(30)});
export const listingSchema=base.and(z.discriminatedUnion("kind",[
 z.object({kind:z.literal("property"),attributes:propertyAttrs}),
 z.object({kind:z.literal("vehicle"),attributes:vehicleAttrs}),
]));
export const reportSchema=z.object({listingId:z.string().uuid(),reason:z.enum(["wrong_info","suspicious_price","duplicate","sold","fraud_risk","other"]),note:z.string().trim().max(500).default("")});
export const contactSchema=z.object({listingId:z.string().uuid(),message:z.string().trim().min(5).max(700)});
