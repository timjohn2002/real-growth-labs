import { HomeHero } from "@/sections/hero/home-hero"
import { FeaturesPreview } from "@/sections/features/features-preview"
import { HowItWorks } from "@/sections/features/how-it-works"
import { ContentTransformation } from "@/sections/features/content-transformation"
import { AllFeatures } from "@/sections/features/all-features"
import { Benefits } from "@/sections/features/benefits"
import { PricingHeroSection } from "@/sections/pricing/pricing-hero-section"
import { TestimonialsSection } from "@/sections/testimonials/testimonials-section"
import { FAQSection } from "@/sections/faq/faq-section"
import { CTASection } from "@/sections/cta/cta-section"

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturesPreview />
      <HowItWorks />
      <ContentTransformation />
      <AllFeatures />
      <Benefits />
      <PricingHeroSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  )
}
