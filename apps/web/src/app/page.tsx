import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
// import Showcase from "@/components/Showcase";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <Showcase /> */}
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </>
  );
}