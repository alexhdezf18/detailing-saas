import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    // <header>: Etiqueta semántica para el encabezado.
    // sticky top-0: Se queda pegado arriba al hacer scroll.
    // z-50: Asegura que flote sobre todo lo demás.
    // backdrop-blur: El efecto "vidrio" de Apple/Windows detrás del menú.
    // border-b: Una línea sutil abajo para separar del contenido.
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* LOGO */}
        <Link
          className="flex items-center gap-2 font-bold text-xl text-white"
          href="#"
        >
          <span className="text-orange-500">Detailing</span>SaaS
        </Link>

        {/* NAVEGACIÓN DESKTOP (Oculta en móviles 'hidden', visible en 'md:flex') */}
        <nav className="hidden gap-6 md:flex">
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            href="#"
          >
            Cómo funciona
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            href="#"
          >
            Precios
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            href="#"
          >
            Galería
          </Link>
        </nav>

        {/* BOTONES DE ACCIÓN (CTAs) */}
        <div className="flex items-center gap-4">
          {/* variant="ghost": Botón sin fondo, solo texto/hover */}
          <Button
            variant="ghost"
            className="text-zinc-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
          >
            Soy un Negocio
          </Button>

          {/* El botón principal con el naranja de acento */}
          <Link href="/reservar">
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
