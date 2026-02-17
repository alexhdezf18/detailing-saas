"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // <--- IMPORTANTE: Agregamos Cards
import {
  LogOut,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  MapPin,
  Filter,
  CalendarDays,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";

interface Booking {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
  address_street?: string;
  address_number?: string;
  address_colonia?: string;
  address_zip?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setBookings(data);
      } catch (error) {
        console.error("Error cargando citas:", error);
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: newStatus } : booking,
      ),
    );

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando:", error);
      toast.error("No se pudo actualizar el estado");
    } else {
      toast.success(`Estado actualizado`);
    }
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
      blocked: "Bloqueado",
    };
    return labels[status] || status;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // COMPONENTE AUXILIAR PARA EL MENÚ DE ACCIONES (Para no repetirlo en PC y Móvil)
  const ActionMenu = ({ booking }: { booking: Booking }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-zinc-950 border-zinc-800 text-zinc-300"
      >
        <DropdownMenuItem onClick={() => updateStatus(booking.id, "confirmed")}>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Confirmar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus(booking.id, "completed")}>
          <CheckSquare className="mr-2 h-4 w-4 text-blue-500" /> Completar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus(booking.id, "pending")}>
          <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pendiente
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => updateStatus(booking.id, "cancelled")}
          className="text-red-500"
        >
          <XCircle className="mr-2 h-4 w-4" /> Cancelar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <main className="min-h-screen bg-black pb-20">
      {" "}
      {/* pb-20 para dar espacio en móvil */}
      <div className="container mx-auto py-6 px-4 md:py-10">
        {/* HEADER RESPONSIVO */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Panel de Control
            </h1>
            <p className="text-zinc-400 text-sm">Gestiona tus reservas.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/calendario" className="w-full md:w-auto">
              <Button
                variant="outline"
                className="w-full border-zinc-800 text-zinc-300"
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Horarios
              </Button>
            </Link>
            <Button variant="destructive" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* FILTROS (Scroll horizontal en móvil) */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 h-8 text-xs whitespace-nowrap ${
                  filter === status
                    ? "bg-white text-black"
                    : "bg-transparent border-zinc-800 text-zinc-400"
                }`}
              >
                {getStatusLabel(status === "all" ? "Todas" : status)}
              </Button>
            ),
          )}
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-10">Cargando...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 border border-zinc-800 rounded-xl border-dashed">
            No hay citas en esta categoría.
          </div>
        ) : (
          <>
            {/* --- VISTA MÓVIL (TARJETAS) --- */}
            {/* 'md:hidden' significa: ocúltalo en pantallas medianas o más grandes */}
            <div className="grid gap-4 md:hidden">
              {filteredBookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="bg-zinc-900/50 border-zinc-800"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium text-white">
                        {booking.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-400 font-normal"
                        >
                          {booking.service_type}
                        </Badge>
                      </div>
                    </div>
                    <ActionMenu booking={booking} />
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {/* Fecha y Hora */}
                    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>
                          {format(new Date(booking.booking_date), "d MMM", {
                            locale: es,
                          })}
                          <span className="text-zinc-500 mx-1">•</span>
                          {booking.booking_time}
                        </span>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    {/* Dirección */}
                    <div className="flex gap-3 text-zinc-400">
                      <MapPin className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                      <div className="leading-tight">
                        <p className="text-zinc-300">
                          {booking.address_street} {booking.address_number}
                        </p>
                        <p className="text-xs">{booking.address_colonia}</p>
                      </div>
                    </div>

                    {/* Botón WhatsApp Grande */}
                    <a
                      href={`https://wa.me/52${booking.phone.replace(/\s+/g, "")}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 w-full bg-green-900/20 text-green-400 py-2 rounded-md font-medium hover:bg-green-900/30 transition-colors mt-2"
                    >
                      <Phone className="h-4 w-4" /> Contactar ({booking.phone})
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* --- VISTA ESCRITORIO (TABLA) --- */}
            {/* 'hidden md:block' significa: ocúltalo en móvil, muéstralo en mediano+ */}
            <div className="hidden md:block rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Cliente</TableHead>
                    <TableHead className="text-zinc-400">Servicio</TableHead>
                    <TableHead className="text-zinc-400">Fecha</TableHead>
                    <TableHead className="text-zinc-400">Estado</TableHead>
                    <TableHead className="text-right text-zinc-400">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className="border-zinc-800 hover:bg-zinc-800/40"
                    >
                      <TableCell>
                        <div className="font-medium text-white">
                          {booking.name}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {booking.address_colonia}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-zinc-800 text-zinc-300 border-zinc-700"
                        >
                          {booking.service_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-zinc-300">
                          {format(
                            new Date(booking.booking_date),
                            "EEE, d MMM",
                            { locale: es },
                          )}
                        </div>
                        <div className="text-xs text-orange-400 font-medium">
                          {booking.booking_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionMenu booking={booking} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
