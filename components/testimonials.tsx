import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// 1. Datos de prueba (Social Proof)
const testimonials = [
  {
    name: "Carlos R.",
    role: "Dueño de BMW Serie 3",
    content: "Increíble servicio. Llegaron puntuales a mi oficina y dejaron el auto impecable mientras yo trabajaba. El detallado de interiores es otro nivel.",
    rating: 5,
  },
  {
    name: "Ana Pau M.",
    role: "Mamá & Arquitecta",
    content: "Con dos niños, mi camioneta era un desastre. El paquete Premium la dejó como nueva. Me encantó que usaran productos biodegradables.",
    rating: 5,
  },
  {
    name: "Roberto G.",
    role: "Vendedor de Autos",
    content: "Uso este servicio para preparar los autos antes de venderlos. La inversión se recupera sola porque los autos se ven mucho más valiosos.",
    rating: 5,
  },
  {
    name: "Sofía L.",
    role: "Estudiante",
    content: "Súper conveniente y seguro. Pude pagar con tarjeta y el técnico fue muy profesional. Definitivamente volveré a agendar.",
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="w-full py-24 bg-black">
      <div className="container mx-auto px-4 md:px-6"> {/* <--- ¡Aquí ya puse el mx-auto! */}
        
        <h2 className="text-3xl font-bold text-center text-white mb-12 tracking-tighter sm:text-4xl">
          Lo que dicen nuestros clientes
        </h2>

        {/* El Carrusel */}
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
                // basis-1/1 = 100% ancho (1 tarjeta visible)
                // md:basis-1/2 = 50% ancho (2 tarjetas visibles)
                // lg:basis-1/3 = 33% ancho (3 tarjetas visibles)
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 h-full">
                      <CardContent className="flex flex-col aspect-square items-start justify-center p-6 gap-4">
                        {/* Estrellas */}
                        <div className="flex gap-1">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                          ))}
                        </div>
                        
                        <p className="text-zinc-300 italic">
                          "{item.content}"
                        </p>
                        
                        <div className="mt-auto">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-sm text-zinc-500">{item.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Flechas de navegación (ocultas en móvil para que sea touch, visibles en desktop) */}
            <CarouselPrevious className="hidden md:flex bg-zinc-800 hover:bg-orange-500 border-none text-white" />
            <CarouselNext className="hidden md:flex bg-zinc-800 hover:bg-orange-500 border-none text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}