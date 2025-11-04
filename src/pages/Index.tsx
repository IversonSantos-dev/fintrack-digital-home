import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Security } from "@/components/Security";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <Security />
        <Newsletter />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
