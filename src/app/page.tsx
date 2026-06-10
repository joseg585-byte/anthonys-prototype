import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HeritageSection } from "@/components/HeritageSection";
import { MenuExplorer } from "@/components/MenuExplorer";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HeritageSection />
        <MenuExplorer />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
