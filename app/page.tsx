import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase";
import { BookingForm } from "@/components/booking-form";

export default function Home() {
  console.log("Supabase conectado:", supabase);
  return (
    <main className="flex min-h-screen flex-col items-center bg-black selection:bg-orange-500 selection:text-white">
      <Hero />
      {/* --- ZONA DE PRUEBAS --- */}
      <section className="py-12 bg-zinc-950">
        <BookingForm />
      </section>
      {/* ----------------------- */}
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
