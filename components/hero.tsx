import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react"; // Iconos de la librería Lucide

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-16 md:pt-20 lg:pt-28">
      {/* Contenedor principal con Grid */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* COLUMNA IZQUIERDA: Texto y CTAs */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              {/* Badge pequeño arriba del título */}
              <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-400 backdrop-blur-xl">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
                Disponible en Chihuahua, MX
              </div>
              
              <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl xl:text-7xl/none">
                Tu Auto, Como Nuevo. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Sin Salir de Casa.
                </span>
              </h1>
              
              <p className="max-w-[600px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto lg:mx-0">
                Servicio profesional de detallado automotriz a domicilio. Agenda tu cita en línea y recupera el brillo de agencia hoy mismo.
              </p>
            </div>

            {/* Lista de beneficios rápida */}
            <ul className="grid gap-2 py-4 text-zinc-300 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" /> Sin filas ni esperas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" /> Productos Premium
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" /> Técnicos Certificados
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" /> Garantía de satisfacción
              </li>
            </ul>

            {/* Botones de acción */}
            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Reservar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800 hover:text-white">
                Ver Nuestros Trabajos
              </Button>
            </div>
          </div>

          {/* COLUMNA DERECHA: Imagen Hero */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
             {/* Efecto de brillo detrás de la imagen (Glow) */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 opacity-30 blur-2xl"></div>
            
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop"
                alt="Detallado de auto deportivo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}