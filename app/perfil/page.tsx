"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Copy, Gift, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserAndProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        console.error("Error cargando perfil:", error);
        toast.error("No se pudo cargar tu información de referidos.");
      }

      setLoading(false);
    }

    getUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyCode = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referral_code);
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
              Hola,{" "}
              {profile?.full_name ||
                user?.user_metadata?.full_name ||
                "Cliente"}
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
              {/* Acceso directo a tu Admin si eres tú */}
              {user?.email === "alexhdezf18@gmail.com" && (
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
                Invita a 5 amigos. Cuando ellos agenden usando tu código, tú
                sumas puntos. ¡A los 5, tu próximo Detallado Premium va por
                nuestra cuenta!
              </p>

              {/* Barra de Progreso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Tu progreso</span>
                  <span>{profile?.points || 0} / 5 amigos</span>
                </div>
                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 transition-all duration-1000"
                    style={{ width: `${((profile?.points || 0) / 5) * 100}%` }}
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
                    {profile?.referral_code || "Cargando..."}
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

          {/* TARJETA DE HISTORIAL */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="text-blue-500 h-5 w-5" />
                Tus Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                <p>Próximamente verás aquí tus reservas pasadas.</p>
                <Link href="/reservar">
                  <Button variant="link" className="text-orange-500 mt-2">
                    ¡Agenda tu cita hoy!
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
