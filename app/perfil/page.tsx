"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Copy,
  Gift,
  Calendar,
  LogOut,
  Clock,
  MapPin,
  Star,
  MessageSquarePlus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function getUserAndData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("email", user.email)
        .order("booking_date", { ascending: false });

      if (bookingsData) setBookings(bookingsData);
      setLoading(false);
    }
    getUserAndData();
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

  const submitReview = async () => {
    if (!reviewingId) return;
    setIsSubmittingReview(true);

    const { error } = await supabase
      .from("bookings")
      .update({ rating, review_text: reviewText })
      .eq("id", reviewingId);

    if (error) {
      toast.error("Error al enviar la reseña", { description: error.message });
    } else {
      toast.success("¡Gracias por tu opinión!", {
        description: "Tu reseña nos ayuda a mejorar.",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewingId ? { ...b, rating, review_text: reviewText } : b,
        ),
      );
      setReviewingId(null);
      setReviewText("");
      setRating(5);
    }
    setIsSubmittingReview(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900/50 text-green-300 border-green-800";
      case "completed":
        return "bg-blue-900/50 text-blue-300 border-blue-800";
      case "cancelled":
        return "bg-red-900/50 text-red-300 border-red-800";
      default:
        return "bg-yellow-900/50 text-yellow-500 border-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      completed: "Completada",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* TARJETA DE PROGRESO */}
          <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden h-fit">
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

          {/* TARJETA DE HISTORIAL CON RESEÑAS */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-500 h-5 w-5" /> Tus Reservas
                </div>
                <Badge
                  variant="outline"
                  className="text-zinc-400 border-zinc-700"
                >
                  {bookings.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  <p>Aún no tienes historial de reservas.</p>
                  <Link href="/reservar">
                    <Button variant="link" className="text-orange-500 mt-2">
                      ¡Agenda tu primera cita!
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-lg border border-zinc-800 bg-black/40 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            {booking.service_type}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(
                              new Date(booking.booking_date),
                              "d MMM yyyy",
                              { locale: es },
                            )}{" "}
                            a las {booking.booking_time}
                          </div>
                        </div>
                        <Badge
                          className={`border ${getStatusColor(booking.status)}`}
                        >
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800/50 pt-2 mt-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {booking.address_street} {booking.address_number}
                          </span>
                        </div>

                        {/* LÓGICA DE RESEÑAS */}
                        {booking.status === "completed" && !booking.rating && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                            onClick={() => setReviewingId(booking.id)}
                          >
                            <MessageSquarePlus className="h-3 w-3 mr-1" />{" "}
                            Calificar
                          </Button>
                        )}

                        {booking.rating && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= booking.rating ? "fill-orange-500 text-orange-500" : "text-zinc-700"}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE RESEÑA */}
      <Dialog
        open={reviewingId !== null}
        onOpenChange={(open) => !open && setReviewingId(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              ¿Qué te pareció el servicio?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Tu opinión es muy importante para nosotros y nos ayuda a seguir
              mejorando.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${star <= rating ? "fill-orange-500 text-orange-500" : "text-zinc-600"}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Cuéntanos tu experiencia (Opcional)"
              className="bg-zinc-950 border-zinc-800 text-white min-h-[100px]"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReviewingId(null)}
              disabled={isSubmittingReview}
            >
              Cancelar
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={submitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enviar Reseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
