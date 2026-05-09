import { PouchRitualHero } from "@/components/home/PouchRitualHero";
import { BestSellers } from "@/components/home/BestSellers";
import { InteractiveVideoReel } from "@/components/home/InteractiveVideoReel";
import { ScenePanel } from "@/components/home/ScenePanel";
import { VialChat } from "@/components/concierge/VialChat";
import { getShopifyFeaturedProducts } from "@/lib/shopify-products";
import { getProductVideoClips } from "@/lib/sanity-media";

export default async function Home() {
  const [featuredProducts, productVideos] = await Promise.all([
    getShopifyFeaturedProducts(8),
    getProductVideoClips(),
  ]);

  return (
    <div className="space-y-8 pb-2 md:space-y-10">
      <ScenePanel>
        <PouchRitualHero />
      </ScenePanel>

      <ScenePanel>
        <BestSellers featured={featuredProducts} />
      </ScenePanel>

      <ScenePanel>
        <InteractiveVideoReel clips={productVideos} />
      </ScenePanel>

      <VialChat />
    </div>
  );
}
