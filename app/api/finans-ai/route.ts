import {NextResponse} from "next/server";
import {getFinanceSnapshot} from "@/lib/finans-ai";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json(await getFinanceSnapshot(),{headers:{"Cache-Control":"no-store"}});}
