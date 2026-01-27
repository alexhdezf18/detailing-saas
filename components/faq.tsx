import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Datos de las preguntas
const faqData = [
  {
    question: "¿Necesito proporcionar agua o electricidad?",
    answer:
      "No. Nuestras unidades móviles son totalmente autónomas. Llevamos nuestro propio generador de electricidad y tanque de agua tratada (libre de minerales para no manchar tu auto).",
  },
  {
    question: "¿Cuánto tiempo tarda el servicio?",
    answer:
      "Depende del paquete. El 'Lavado Express' toma aproximadamente 45-60 minutos. El 'Detallado Premium' toma entre 3 y 4 horas debido a la profundidad de la limpieza y el secado de vestiduras.",
  },
  {
    question: "¿Qué pasa si llueve el día de mi cita?",
    answer:
      "En Chihuahua el clima cambia rápido. Si llueve o hay pronóstico de lluvia fuerte, te contactaremos para reagendar tu cita para el siguiente espacio disponible sin ningún costo adicional.",
  },
  {
    question: "¿Aceptan pagos con tarjeta?",
    answer:
      "Sí. Todos nuestros técnicos llevan terminal bancaria. Aceptamos Visa, Mastercard, AMEX, Transferencia SPEI y Efectivo.",
  },
  {
    question: "¿Hacen servicio en oficinas o departamentos?",
    answer:
      "Sí, siempre y cuando la administración del edificio permita el acceso y el lavado de vehículos en el estacionamiento. Por favor verifica esto con tu seguridad antes de reservar.",
  },
];

export function FAQ() {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {" "}
        {/* max-w-3xl hace que no se estire demasiado a lo ancho */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-zinc-400">
            Resolvemos tus dudas antes de que reserves.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-zinc-800"
            >
              <AccordionTrigger className="text-zinc-100 hover:text-orange-500 hover:no-underline text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-400">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
