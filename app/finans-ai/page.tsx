import type {Metadata} from "next";
import {FinanceDashboard} from "@/components/finance-dashboard";
export const metadata:Metadata={alternates:{canonical:"/finans-ai"},title:"FinansAI · Piyasaların gündemi",description:"Borsa İstanbul, döviz, metaller, kripto ve emtia fiyatlarını kaynak ve veri zamanıyla takip edin."};
export default function Page(){return <FinanceDashboard/>;}
