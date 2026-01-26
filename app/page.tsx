import { Hero } from "@/components/hero";
import { Features } from "@/components/features"; 
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black selection:bg-orange-500 selection:text-white">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      /*Commit pequeño por si acaso*/
    </main>
  );
}