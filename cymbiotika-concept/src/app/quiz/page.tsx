import { QuizRunner } from "@/components/quiz/QuizRunner";
import { getShopifyProducts } from "@/lib/shopify-products";

export default async function QuizPage() {
  const products = await getShopifyProducts();

  return (
    <div className="pb-14">
      <QuizRunner products={products} />
    </div>
  );
}
