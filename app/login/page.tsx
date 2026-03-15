"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Error de conexión", { description: error.message });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (email.toLowerCase() === "alexhdezf18@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/reservar");
      }
    } catch (error: any) {
      toast.error("Acceso denegado", {
        description: "Credenciales administrativas incorrectas.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm space-y-6 border border-zinc-800 bg-zinc-900/60 p-8 rounded-2xl backdrop-blur-xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-orange-500/20 shadow-lg shadow-orange-500/20">
            <Image
              src="/logo.jpg"
              alt="Logo Papotico's Wash"
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bienvenido
            </h1>
            <p className="text-zinc-400 text-sm">
              Inicia sesión para agendar tu cita.
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-white text-black hover:bg-zinc-200 border-none font-bold py-6 text-md shadow-lg transition-transform hover:scale-[1.02]"
          onClick={handleGoogleLogin}
        >
          <svg
            className="mr-3 h-5 w-5"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Continuar con Google
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-semibold tracking-wider">
            <span className="bg-zinc-900 px-3 text-zinc-500">
              O con tu correo
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-zinc-400 text-xs uppercase tracking-wider"
            >
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-zinc-800 text-white focus-visible:ring-orange-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-zinc-400 text-xs uppercase tracking-wider"
            >
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-zinc-800 text-white focus-visible:ring-orange-500 h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-zinc-800 hover:bg-orange-600 text-zinc-300 hover:text-white transition-colors h-11"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-orange-500 transition-colors font-medium"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </main>
  );
}
