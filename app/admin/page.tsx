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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Navigation,
  Car,
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
  vehicle_make?: string;
  vehicle_model?: string;
  trunk_vacuum?: boolean;
}

const getLocalDate = (dbDateString: string) => {
  if (!dbDateString) return new Date();
  const [year, month, day] = dbDateString.split("T")[0].split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

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
      <div className="container mx-auto py-6 px-4 md:py-10">
        {/* HEADER RESPONSIVO */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Panel de Control
            </h1>
            <p className="text-zinc-400 text-sm">
              Gestiona tus reservas y rutas.
            </p>
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

        {/* FILTROS */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 h-8 text-xs whitespace-nowrap ${
                  filter === status
                    ? "bg-white text-black font-bold"
                    : "bg-transparent border-zinc-800 text-zinc-400"
                }`}
              >
                {getStatusLabel(status === "all" ? "Todas" : status)}
              </Button>
            ),
          )}
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-10">
            Cargando logística...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center text-zinc-500 py-10 border border-zinc-800 rounded-xl border-dashed bg-zinc-900/20">
            No hay citas en esta categoría.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:hidden">
              {filteredBookings.map((booking) => {
                const fullAddress = `${booking.address_street || ""} ${booking.address_number || ""}, ${booking.address_colonia || ""}, C.P. ${booking.address_zip || ""}, Chihuahua`;
                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
                const whatsappLink = `https://wa.me/52${booking.phone.replace(/\s+/g, "")}`;

                return (
                  <Card
                    key={booking.id}
                    className="bg-zinc-900/60 border-zinc-800 overflow-hidden shadow-lg"
                  >
                    <CardHeader className="flex flex-row items-start justify-between pb-2 bg-zinc-950/50 border-b border-zinc-800/50 p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-orange-500/30 text-orange-400 font-bold bg-orange-500/10"
                          >
                            {booking.service_type}
                          </Badge>
                          {booking.trunk_vacuum && (
                            <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                              + Cajuela
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold text-white pt-1">
                          {booking.name}
                        </CardTitle>
                      </div>
                      <ActionMenu booking={booking} />
                    </CardHeader>

                    <CardContent className="space-y-4 p-4 text-sm">
                      {/* Fecha, Hora y Estado */}
                      <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                        <div className="flex items-center gap-2 text-zinc-200 font-medium">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="capitalize">
                            {/* ✅ USO DE getLocalDate */}
                            {format(
                              getLocalDate(booking.booking_date),
                              "d MMM",
                              {
                                locale: es,
                              },
                            )}
                            <span className="text-zinc-600 mx-1.5">|</span>
                            {booking.booking_time}
                          </span>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      {/* Vehículo */}
                      <div className="flex items-center gap-3 text-zinc-300">
                        <div className="bg-zinc-800/80 p-1.5 rounded-md">
                          <Car className="h-4 w-4 text-zinc-400" />
                        </div>
                        <span className="font-medium">
                          {booking.vehicle_make || "Vehículo"}{" "}
                          {booking.vehicle_model || "No especificado"}
                        </span>
                      </div>

                      {/* Dirección Logística */}
                      <div className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-zinc-800/50">
                        <MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="leading-relaxed flex-1">
                          <p className="text-white font-medium">
                            {booking.address_street} #{booking.address_number}
                          </p>
                          <p className="text-zinc-400 text-xs">
                            Col. {booking.address_colonia}, C.P.{" "}
                            {booking.address_zip}
                          </p>

                          <a
                            href={mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 bg-blue-500/10 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Navigation className="h-3 w-3" />
                            Navegar en Maps
                          </a>
                        </div>
                      </div>

                      {/* Botón WhatsApp */}
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] py-2.5 rounded-lg font-bold hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/20"
                      >
                        <Phone className="h-4 w-4" /> Contactar al{" "}
                        {booking.phone}
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* --- VISTA ESCRITORIO: TABLA ENRIQUECIDA --- */}
            {/* ========================================================= */}
            <div className="hidden md:block rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-2xl">
              <Table>
                <TableHeader className="bg-zinc-950/80 border-b border-zinc-800">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-semibold py-4">
                      Cliente
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold">
                      Vehículo
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold">
                      Logística
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold">
                      Servicio
                    </TableHead>
                    <TableHead className="text-zinc-400 font-semibold">
                      Estado
                    </TableHead>
                    <TableHead className="text-right text-zinc-400 font-semibold">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const fullAddress = `${booking.address_street || ""} ${booking.address_number || ""}, ${booking.address_colonia || ""}, C.P. ${booking.address_zip || ""}`;
                    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ", Chihuahua")}`;
                    const whatsappLink = `https://wa.me/52${booking.phone.replace(/\s+/g, "")}`;

                    return (
                      <TableRow
                        key={booking.id}
                        className="border-zinc-800 hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* 1. Cliente */}
                        <TableCell className="py-4">
                          <div className="font-bold text-white text-sm">
                            {booking.name}
                          </div>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#25D366] hover:underline mt-1 flex items-center gap-1 font-medium"
                          >
                            <Phone className="h-3 w-3" /> {booking.phone}
                          </a>
                        </TableCell>

                        {/* 2. Vehículo */}
                        <TableCell>
                          <div className="text-zinc-200 text-sm font-medium">
                            {booking.vehicle_make} {booking.vehicle_model}
                          </div>
                          {booking.trunk_vacuum && (
                            <div className="mt-1">
                              <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                + Cajuela
                              </span>
                            </div>
                          )}
                        </TableCell>

                        {/* 3. Logística (Dirección + Maps) */}
                        <TableCell>
                          <div
                            className="text-xs text-zinc-300 max-w-[220px] truncate"
                            title={fullAddress}
                          >
                            <span className="font-semibold text-white">
                              {booking.address_street} #{booking.address_number}
                            </span>
                            , {booking.address_colonia}
                          </div>
                          <a
                            href={mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1.5 font-medium"
                          >
                            <Navigation className="h-3 w-3" /> Abrir en Maps
                          </a>
                        </TableCell>

                        {/* 4. Servicio / Fecha */}
                        <TableCell>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-bold"
                            >
                              {booking.service_type}
                            </Badge>
                          </div>
                          <div className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">
                              {/* ✅ USO DE getLocalDate */}
                              {format(
                                getLocalDate(booking.booking_date),
                                "d MMM",
                                {
                                  locale: es,
                                },
                              )}
                            </span>{" "}
                            • {booking.booking_time}
                          </div>
                        </TableCell>

                        {/* 5. Estado */}
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </TableCell>

                        {/* 6. Acciones */}
                        <TableCell className="text-right">
                          <ActionMenu booking={booking} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
