import { PublicNav } from "@/components/public/nav";
import { HeroSection } from "@/components/public/hero";
import { ServicesSection } from "@/components/public/services";
import { WhyUsSection } from "@/components/public/why-us";
import { ContactSection } from "@/components/public/contact";
import { PublicFooter } from "@/components/public/footer";

export default function PublicHomePage() {
  return (
    <div className="bg-[#0a0a0b] text-white min-h-screen">
      <PublicNav />
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ContactSection />
      <PublicFooter />
    </div>
  );
}