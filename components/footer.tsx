import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react"; // Iconos sociales
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-zinc-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* GRID PRINCIPAL: 4 Columnas */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12 mb-12">
          {/* Columna 1: Marca y Slogan */}
          <div className="col-span-2 md:col-span-1">
            <Link
              className="flex items-center gap-2 font-bold text-xl text-white mb-4"
              href="#"
            >
              <span className="text-orange-500">Detailing</span>SaaS
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              La plataforma líder para reservar servicios de estética automotriz
              a domicilio en Chihuahua. Calidad de agencia en tu cochera.
            </p>
            {/* Redes Sociales */}
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-zinc-400 hover:text-orange-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-zinc-400 hover:text-orange-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-zinc-400 hover:text-orange-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Columna 2: Producto */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white">Producto</h3>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Precios
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Cómo funciona
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Galería
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Reseñas
            </Link>
          </div>

          {/* Columna 3: Compañía */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white">Compañía</h3>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Nosotros
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Blog
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Bolsa de trabajo
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Contacto
            </Link>
          </div>

          {/* Columna 4: Legal y CTA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white">Legal</h3>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Privacidad
            </Link>
            <Link href="#" className="text-sm text-zinc-400 hover:text-white">
              Términos y condiciones
            </Link>

            <div className="mt-4">
              <p className="text-xs text-zinc-500 mb-2">
                ¿Tienes un negocio de detallado?
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white"
              >
                Vende tu software
              </Button>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR: Copyright */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-500 text-center md:text-left">
            © 2026 Detailing SaaS Inc. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>Hecho con ❤️ en Chihuahua, MX</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
