"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Gift, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulación de datos (En el siguiente paso los conectaremos a la DB real)
  const REFERRAL_CODE = "ALEX-2026";
  const REFERRALS_COUNT = 2; // Llevas 2 de 5

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(REFERRAL_CODE);
    toast.success("¡Código copiado!", {
      description: "Compártelo con tus amigos.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-20">
      {/* Navbar Manual (o reusar el componente si ya maneja auth) */}
      <div className="container mx-auto px-4 py-8">
        {/* HEADER PERFIL */}
        <div className="flex flex-col md:flex-row gap-6 items-center mb-12">
          <Avatar className="h-24 w-24 border-2 border-orange-500">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-zinc-800 text-white text-xl">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Hola, {user?.user_metadata?.full_name || "Cliente"}
            </h1>
            <p className="text-zinc-400">{user?.email}</p>
            <div className="flex gap-2 justify-center md:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 border-red-900/50 hover:bg-red-950/50"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
              </Button>
              {/* Si el email es el tuyo, botón para ir al admin */}
              {user?.email === "alexhdezf18@gmail.com" && ( // <--- CAMBIA TU EMAIL AQUÍ
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    Ir al Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN REFERIDOS */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* TARJETA DE PROGRESO */}
          <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Gift className="h-32 w-32 text-orange-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="text-orange-500 h-5 w-5" />
                Gana un Lavado Gratis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-400 text-sm">
                Invita a 5 amigos y obtén un servicio "Detallado Premium"
                totalmente gratis.
              </p>

              {/* Barra de Progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Tu progreso</span>
                  <span>{REFERRALS_COUNT} / 5 amigos</span>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 transition-all duration-1000"
                    style={{ width: `${(REFERRALS_COUNT / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Código de Referido */}
              <div className="bg-black/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between mt-4">
                <div className="text-xs text-zinc-500 uppercase tracking-widest">
                  Tu código:
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-orange-400 font-mono font-bold text-lg tracking-wider">
                    {REFERRAL_CODE}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                    onClick={copyCode}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TARJETA DE HISTORIAL (Placeholder) */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="text-blue-500 h-5 w-5" />
                Tus Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                <p>Aún no tienes historial de reservas.</p>
                <Link href="/reservar">
                  <Button variant="link" className="text-orange-500">
                    ¡Agenda la primera!
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
