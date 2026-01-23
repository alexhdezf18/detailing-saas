import { Hero } from "@/components/hero";
import { Features } from "@/components/features"; 

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black selection:bg-orange-500 selection:text-white">
      <Hero />
      <Features />
    </main>
  );
}