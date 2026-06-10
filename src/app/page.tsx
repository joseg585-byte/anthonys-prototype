import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HeritageSection } from "@/components/HeritageSection";
import { MenuExplorer } from "@/components/MenuExplorer";
import { WhySejo } from "@/components/WhySejo";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { PitchBanner } from "@/components/PitchBanner";

export default function Home() {
  return (
    <>
      <PitchBanner />
      <Header />
      <main>
        <Hero />
        <HeritageSection />
        <MenuExplorer />
        <WhySejo />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
