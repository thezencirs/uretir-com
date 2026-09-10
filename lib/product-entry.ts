import { makers, products, type City, type ProductCategory, type ProductPlatform } from "@/lib/marketplace";
import { findManagedProduct } from "@/lib/marketplace-management";
export async function getProductEntry(slug: string) {
  const local = products.find((product) => product.slug === slug);

  try {
    const record = await findManagedProduct(slug);
    if (!record) return local ? { product: local, maker: makers[local.maker], managed: false } : null;
    return {
      product: { slug: record.slug, name: record.name, maker: `managed-${record.id}`, category: record.category as ProductCategory, platform: record.platform as ProductPlatform, task: record.task, description: record.description, url: record.url },
      maker: { name: record.makerName, city: record.city as City, source: record.makerUrl, locationSource: record.locationSourceUrl, color: record.color },
      managed: true,
    };
  } catch { return local ? { product: local, maker: makers[local.maker], managed: false } : null; }
}
