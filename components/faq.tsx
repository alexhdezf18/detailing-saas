import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "¿Necesito proporcionar agua o electricidad?",
    answer:
      "Sí. Para mantener precios accesibles y brindar un servicio de alta calidad, requerimos acceso a una toma de agua estándar (llave de manguera) y un enchufe de corriente eléctrica (110v) a una distancia máxima de 20 metros de tu vehículo. Nosotros llevamos las mangueras, extensiones, hidrolavadora, químicos profesionales y todo el equipo necesario para dejar tu auto impecable.",
  },
  {
    question: "¿Cuánto tiempo tarda el servicio?",
    answer:
      "Depende del paquete elegido y el tamaño de tu vehículo. El 'FAST MODE' toma un tiempo promedio de 1 hora a 1 hora y media. Por su parte, el 'DETAILING MODE' toma un promedio de 2 a 3 horas debido a la profundidad de la limpieza, el detallado con brocha y el tratamiento de plásticos.",
  },
  {
    question: "¿Qué pasa si llueve el día de mi cita?",
    answer:
      "En Chihuahua el clima cambia rápido. Si llueve o hay pronóstico de lluvia fuerte, te contactaremos para reagendar tu cita para el siguiente espacio disponible sin ningún costo adicional.",
  },
  {
    question: "¿Aceptan pagos con tarjeta o terminal?",
    answer:
      "Por el momento no contamos con terminal bancaria. El pago se realiza al finalizar el servicio y aceptamos únicamente Efectivo o Transferencia Interbancaria (SPEI).",
  },
  {
    question: "¿Hacen servicio en oficinas o departamentos?",
    answer:
      "Sí, siempre y cuando la administración del edificio permita el lavado de vehículos en el estacionamiento y nos puedas garantizar el acceso a la toma de agua y corriente eléctrica. Por favor verifica esto con tu personal de seguridad antes de reservar.",
  },
];

export function FAQ() {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
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
              <AccordionContent className="text-zinc-400 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
