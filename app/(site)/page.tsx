import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import BookingStripSection from "@/components/sections/BookingStripSection";
import NewsPreviewSection from "@/components/sections/NewsPreviewSection";
import BranchNearbySection from "@/components/sections/BranchNearbySection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BookingStripSection />
      <NewsPreviewSection />
      <BranchNearbySection />
    </>
  );
}
