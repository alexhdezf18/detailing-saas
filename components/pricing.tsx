import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; 

// 1. Estructura de los datos
interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean; // <--- Esta "bandera" nos dirá cuál resaltar
}

// 2. Nuestros productos
const plans: PricingPlan[] = [
  {
    name: "Lavado Express",
    price: "$350",
    description: "Mantenimiento rápido para autos que se lavan frecuentemente.",
    features: [
      "Lavado exterior con shampoo pH neutro",
      "Aspirado general de interiores",
      "Limpieza de vidrios y espejos",
      "Brillo para llantas (Tire Gel)",
    ],
    popular: false,
  },
  {
    name: "Detallado Premium",
    price: "$950",
    description: "El favorito. Limpieza profunda para renovar tu auto.",
    features: [
      "Todo lo del plan Express",
      "Descontaminación de pintura (Clay Bar)",
      "Cera sintética (duración 3 meses)",
      "Limpieza profunda de tapicería/piel",
      "Hidratación de plásticos interiores",
    ],
    popular: true, // <--- ¡ESTE ES EL QUE QUEREMOS VENDER!
  },
  {
    name: "Cerámico Total",
    price: "$2,500",
    description: "Protección extrema y brillo espejo garantizado.",
    features: [
      "Todo lo del plan Premium",
      "Corrección de pintura (1 paso)",
      "Recubrimiento Cerámico (1 año)",
      "Limpieza de motor a vapor",
      "Impermeabilización de telas",
    ],
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="w-full py-24 md:py-32 bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
            Precios Simples y Transparentes
          </h2>
          <p className="max-w-[600px] text-zinc-400 md:text-xl">
            Elige el nivel de cuidado que tu auto merece. Sin costos ocultos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              // AQUI USAMOS LA MAGIA DE `cn`:
              // Si plan.popular es true, agregamos borde naranja y fondo un poco más claro.
              // Si no, borde gris y fondo transparente.
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:scale-105",
                plan.popular 
                  ? "border-orange-500 bg-zinc-900/50 shadow-orange-500/20" 
                  : "border-zinc-800 bg-transparent hover:bg-zinc-900/20"
              )}
            >
              {/* Etiqueta flotante solo para el popular */}
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-orange-500 px-3 py-1 text-center text-sm font-medium text-white shadow-md">
                  Más Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-medium text-zinc-200">{plan.name}</h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className="ml-1 text-zinc-400">/mxn</span>
                </div>
                <p className="mt-4 text-sm text-zinc-400">{plan.description}</p>
              </div>

              {/* Lista de características */}
              <ul className="mb-8 space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={cn("h-5 w-5 flex-shrink-0", plan.popular ? "text-orange-500" : "text-zinc-500")} />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* El botón también cambia de color si es popular */}
              <Button 
                className={cn(
                  "w-full font-semibold", 
                  plan.popular 
                    ? "bg-orange-600 hover:bg-orange-700 text-white" 
                    : "bg-white text-black hover:bg-zinc-200"
                )}
              >
                Elegir {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}