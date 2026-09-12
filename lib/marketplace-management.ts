import { z } from "zod";
import { getPrisma } from "@/lib/puan-ai/db";

const httpsUrl = z.string().url().max(500).refine((value) => value.startsWith("https://"), "Bağlantı HTTPS olmalıdır.");
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Renk #RRGGBB biçiminde olmalıdır.");

export const marketplaceProductInput = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  makerName: z.string().trim().min(2).max(100),
  city: z.enum(["İstanbul", "Ankara", "İzmir", "Bursa", "Eskişehir"]),
  category: z.enum(["Yapay zekâ", "Oyun", "Mobil uygulama", "İş araçları"]),
  platform: z.enum(["WEB", "MOBILE"]),
  task: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(1200),
  url: httpsUrl,
  makerUrl: httpsUrl,
  locationSourceUrl: httpsUrl,
  color,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export const marketplaceProductPatch = marketplaceProductInput.partial().refine((value) => Object.keys(value).length > 0);

export async function listManagedProducts(publishedOnly = false) {
  return getPrisma().marketplaceProduct.findMany({
    where: publishedOnly ? { status: "PUBLISHED" } : undefined,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
}

export async function findManagedProduct(slug: string) {
  return getPrisma().marketplaceProduct.findFirst({ where: { slug, status: "PUBLISHED" } });
}
