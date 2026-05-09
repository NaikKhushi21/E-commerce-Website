import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { getShopifyProductByHandle, getShopifyProducts } from "@/lib/shopify-products";
import { getIngredientsForProduct } from "@/lib/sanity-ingredients";
import { getProductReviews } from "@/lib/sanity-reviews";

export async function generateStaticParams() {
  const products = await getShopifyProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getShopifyProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const [ingredients, reviews] = await Promise.all([
    getIngredientsForProduct(product),
    getProductReviews(product.handle),
  ]);

  return (
    <ProductDetailClient
      product={product}
      ingredients={ingredients}
      reviews={reviews}
    />
  );
}
