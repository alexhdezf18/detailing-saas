import { ShieldCheck, Zap, Star, Truck } from "lucide-react"; // Importamos los iconos

// 1. Definimos la estructura de nuestros datos (TypeScript Interface)
// Esto sirve para que VS Code nos avise si nos falta un título o una descripción.
interface Feature {
  title: string;
  description: string;
  icon: React.ElementType; // Tipo especial para componentes de React (iconos)
}

// 2. Creamos la lista de datos (El "Array")
const featuresList: Feature[] = [
  {
    title: "Servicio a Domicilio",
    description: "Llevamos agua, electricidad y todo el equipo necesario. Tú solo entréganos las llaves.",
    icon: Truck,
  },
  {
    title: "Productos Premium",
    description: "Utilizamos ceras y shampoos biodegradables de grado profesional (Chemical Guys, Meguiar's).",
    icon: ShieldCheck,
  },
  {
    title: "Reserva Instantánea",
    description: "Olvídate de llamar. Agenda tu cita en tiempo real desde tu celular en menos de 2 minutos.",
    icon: Zap,
  },
  {
    title: "Garantía de Calidad",
    description: "Si no quedas satisfecho con el resultado, regresamos a corregirlo sin costo extra.",
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
          Transformamos la experiencia de cuidar tu vehículo con tecnología y profesionales capacitados.
        </p>
      </div>

      {/* Grid de Features (Aquí ocurre la magia del .map) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {featuresList.map((feature, index) => (
          <div 
            key={index} // React necesita una "key" única para saber qué elemento es cual
            className="flex flex-col items-center text-center p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
          >
            {/* Círculo del icono */}
            <div className="p-3 rounded-full bg-orange-500/10 mb-4">
              <feature.icon className="h-8 w-8 text-orange-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}