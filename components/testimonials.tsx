"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Respaldo por si aún no hay reseñas reales en la base de datos
const fallbackTestimonials = [
  {
    name: "Carlos R.",
    role: "Cliente de papotico's wash",
    content:
      "Increíble servicio. Llegaron puntuales y dejaron el auto impecable. El detallado de interiores es otro nivel.",
    rating: 5,
  },
  {
    name: "Ana Pau M.",
    role: "Cliente de papotico's wash",
    content:
      "Con dos niños, mi camioneta era un desastre. El paquete Premium la dejó como nueva. Me encantó que usaran productos profesionales.",
    rating: 5,
  },
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      // Traer reseñas de 4 o 5 estrellas que tengan un comentario escrito
      const { data, error } = await supabase
        .from("bookings")
        .select("name, service_type, review_text, rating")
        .gte("rating", 4)
        .not("review_text", "is", null)
        .neq("review_text", "")
        .order("booking_date", { ascending: false })
        .limit(6); // Mostrar máximo las 6 más recientes

      if (data && data.length > 0) {
        // Mapeamos los datos de la DB al formato que usa el carrusel
        const formattedData = data.map((b) => ({
          name: b.name,
          role: `Servicio: ${b.service_type}`,
          content: b.review_text,
          rating: b.rating,
        }));
        setTestimonials(formattedData);
      } else {
        // Si no hay reseñas reales, mostramos el respaldo
        setTestimonials(fallbackTestimonials);
      }
      setLoading(false);
    }

    fetchReviews();
  }, []);

  return (
    <section className="w-full py-24 bg-black">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center text-white mb-12 tracking-tighter sm:text-4xl">
          Lo que dicen nuestros clientes
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl"
            >
              <CarouselContent>
                {testimonials.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1 h-full">
                      <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 h-full">
                        <CardContent className="flex flex-col h-full items-start justify-between p-6 gap-4">
                          <div className="space-y-4 w-full">
                            {/* Estrellas */}
                            <div className="flex gap-1">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-5 h-5 fill-orange-500 text-orange-500"
                                />
                              ))}
                            </div>

                            <p className="text-zinc-300 italic text-sm md:text-base leading-relaxed line-clamp-4">
                              "{item.content}"
                            </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-zinc-800 w-full">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-xs text-orange-500 font-medium">
                              {item.role}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex bg-zinc-800 hover:bg-orange-500 border-none text-white" />
              <CarouselNext className="hidden md:flex bg-zinc-800 hover:bg-orange-500 border-none text-white" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
