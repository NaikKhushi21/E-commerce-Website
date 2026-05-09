import { LivingDiagnosis } from "@/components/quiz/LivingDiagnosis";
import { getShopifyProducts } from "@/lib/shopify-products";

export default async function QuizPage() {
  const products = await getShopifyProducts();

  return (
    <div className="pb-14">
      <LivingDiagnosis products={products} />
    </div>
  );
}
