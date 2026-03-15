import { ShieldCheck, Zap, Star, Truck } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

const featuresList: Feature[] = [
  {
    title: "Servicio a Domicilio",
    description:
      "Llevamos hidrolavadora, mangueras y extensiones. Solo indícanos dónde conectarnos (agua y luz a menos de 20m) y nosotros hacemos el resto.",
    icon: Truck,
  },
  {
    title: "Productos Premium",
    description: "Utilizamos productos profesionales para cuidar tu pintura.",
    icon: ShieldCheck,
  },
  {
    title: "Reserva Inteligente",
    description:
      "Olvídate de llamar o mandar mensajes esperando respuesta. Agenda tu cita en tiempo real desde tu celular en menos de 2 minutos.",
    icon: Zap,
  },
  {
    title: "Resultados Impecables",
    description:
      "Nos obsesionan los detalles. Trabajamos con los más altos estándares de limpieza para asegurar que tu vehículo recupere su brillo de agencia.",
    icon: Star,
  },
];

export function Features() {
  return (
    <section className="container py-24 md:py-32 space-y-8">
      {/* Encabezado de la sección */}
      <div className="text-center max-w-[800px] mx-auto space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
          Más que un simple lavado de autos
        </h2>
        <p className="text-zinc-400 md:text-xl">
          Transformamos la experiencia de cuidar tu vehículo con tecnología y
          profesionales capacitados.
        </p>
      </div>

      {/* Grid de Features */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {featuresList.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
          >
            {/* Círculo del icono */}
            <div className="p-3 rounded-full bg-orange-500/10 mb-4">
              <feature.icon className="h-8 w-8 text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
