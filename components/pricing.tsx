import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PricingPlan = {
  name: string;
  price: string;
  time: string;
  description: string;
  features: string[];
  popular: boolean;
  dynamicPrices: { size: string; amount: string }[];
};

const plans: PricingPlan[] = [
  {
    name: "FAST MODE",
    price: "Desde $200 MXN",
    time: "1 a 1.5 horas",
    description:
      "Mantenimiento rápido para recuperar el brillo. Ideal para autos con suciedad ligera.",
    features: [
      "Lavado de carrocería y secado",
      "Aspirada superficial",
      "Limpieza de cara de rines y neumáticos",
      "Limpieza superficial de tableros y puertas",
      "Abrillantador en llantas",
    ],
    popular: false,
    dynamicPrices: [
      { size: "Sedán / SUV Pequeña", amount: "$200" },
      { size: "SUV Mediana / Pickup Pequeña", amount: "$250" },
      { size: "SUV / Pickup Tamaño Completo", amount: "$300" },
    ],
  },
  {
    name: "DETAILING MODE",
    price: "Desde $250 MXN",
    time: "2 a 3 horas",
    description:
      "El favorito. Limpieza profunda y meticulosa para renovar y proteger tu auto.",
    features: [
      "Aplicación de prelavado",
      "Lavado de carrocería y secado",
      "Aspirada profunda",
      "Detallado con brocha en tablero y puertas",
      "Restaurador de plásticos en interiores",
      "Limpieza profunda en rines (cara e interior)",
      "Limpiador de cristales sin amoniaco",
      "Abrillantador de llantas",
    ],
    popular: true,
    dynamicPrices: [
      { size: "Sedán / SUV Pequeña", amount: "$250" },
      { size: "SUV Mediana / Pickup Pequeña", amount: "$300" },
      { size: "SUV / Pickup Tamaño Completo", amount: "$350" },
    ],
  },
];

export function Pricing() {
  return (
    <section id="precios" className="w-full py-24 md:py-32 bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
            Precios Simples y Transparentes
          </h2>
          <p className="max-w-[600px] text-zinc-400 md:text-xl">
            Elige el nivel de cuidado que tu auto merece. Sin costos ocultos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:scale-105",
                plan.popular
                  ? "border-orange-500 bg-zinc-900/50 shadow-orange-500/20"
                  : "border-zinc-800 bg-transparent hover:bg-zinc-900/20",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-orange-500 px-3 py-1 text-center text-sm font-medium text-white shadow-md">
                  Más Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-medium text-zinc-200">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline text-white">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                </div>

                <p className="mt-2 text-sm font-medium text-orange-400">
                  ⏱ {plan.time}
                </p>

                <p className="mt-4 text-sm text-zinc-400">{plan.description}</p>
              </div>

              <ul className="mb-6 space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        plan.popular ? "text-orange-500" : "text-zinc-500",
                      )}
                    />
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-8 p-5 bg-zinc-950/80 rounded-xl border border-zinc-800/50">
                <p className="text-xs font-semibold text-orange-500 mb-4 uppercase tracking-wider">
                  Inversión por tamaño
                </p>
                <ul className="space-y-3 text-sm text-zinc-400">
                  {plan.dynamicPrices.map((dp, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0"
                    >
                      <span>{dp.size}</span>
                      <span className="text-white font-medium">
                        {dp.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/reservar" className="mt-auto">
                <Button
                  className={cn(
                    "w-full font-semibold",
                    plan.popular
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-white text-black hover:bg-zinc-200",
                  )}
                >
                  Elegir {plan.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-500 mt-12 text-sm">
          * Aspirada de cajuela: Costo extra de $30 MXN al momento del servicio.
        </p>
      </div>
    </section>
  );
}
