import { Navbar } from "@/components/navbar"; // Reusamos el Navbar
import { BookingForm } from "@/components/booking-form";
import { Footer } from "@/components/footer"; // Reusamos el Footer

export default function BookPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          {/* Lado Izquierdo: Texto motivador */}
          <div className="hidden md:block space-y-6">
            <h1 className="text-4xl font-bold text-white tracking-tighter">
              Tu auto merece lo <span className="text-orange-500">mejor</span>.
            </h1>
            <p className="text-zinc-400 text-lg">
              Estás a un paso de recuperar el brillo de agencia. Agenda tu cita
              en menos de 2 minutos y nosotros nos encargamos del resto.
            </p>
            <ul className="space-y-4 text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Sin cargos ocultos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Confirmación inmediata
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Pago al finalizar el servicio
              </li>
            </ul>
          </div>

          {/* Lado Derecho: El Formulario */}
          <div>
            <BookingForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
