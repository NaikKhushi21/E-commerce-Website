import { PouchRitualHero } from "@/components/home/PouchRitualHero";
import { BestSellers } from "@/components/home/BestSellers";
import { AbsorptionExplainer } from "@/components/home/AbsorptionExplainer";
import { InteractiveVideoReel } from "@/components/home/InteractiveVideoReel";
import { ReviewsModule } from "@/components/home/ReviewsModule";
import { BlogTeaserStrip } from "@/components/home/BlogTeaserStrip";
import { ScenePanel } from "@/components/home/ScenePanel";
import { VialChat } from "@/components/concierge/VialChat";
import { getShopifyFeaturedProducts } from "@/lib/shopify-products";
import { getProductVideoClips } from "@/lib/sanity-media";
import { getProductReviews } from "@/lib/sanity-reviews";
import { getSanityBlogPosts } from "@/lib/sanity-blog";

export default async function Home() {
  const [featuredProducts, productVideos, reviews, blogPosts] = await Promise.all([
    getShopifyFeaturedProducts(8),
    getProductVideoClips(),
    getProductReviews(),
    getSanityBlogPosts(),
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
        <AbsorptionExplainer />
      </ScenePanel>

      <ScenePanel>
        <InteractiveVideoReel clips={productVideos} />
      </ScenePanel>

      <ScenePanel>
        <ReviewsModule reviews={reviews} />
      </ScenePanel>

      <ScenePanel>
        <BlogTeaserStrip posts={blogPosts} />
      </ScenePanel>

      <VialChat />
    </div>
  );
}
