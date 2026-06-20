import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCards } from "@/components/landing/feature-cards";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { TrustBar, CtaSection } from "@/components/landing/trust-bar";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeatureCards />
      <SocialProofSection />
      <CtaSection />
    </>
  );
}
