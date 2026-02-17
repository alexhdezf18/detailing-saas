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
import { toast } from "sonner"; // Importamos Toast para notificaciones bonitas

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

  // ESTADO NUEVO: El filtro actual (por defecto 'all' muestra todo)
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
    // Optimistic UI update
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
      toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900/50 text-green-300 hover:bg-green-900/70 border-green-800";
      case "completed":
        return "bg-blue-900/50 text-blue-300 hover:bg-blue-900/70 border-blue-800";
      case "cancelled":
        return "bg-red-900/50 text-red-300 hover:bg-red-900/70 border-red-800";
      default:
        return "bg-yellow-900/50 text-yellow-500 hover:bg-yellow-900/70 border-yellow-800";
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

  // LÓGICA DE FILTRADO
  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-sm text-zinc-500">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto py-10 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Panel de Control
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Bienvenido de nuevo, Alex.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Link href="/admin/calendario">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Horarios
              </Button>
            </Link>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-red-950/50 text-red-400 hover:bg-red-900 border border-red-900/50"
            >
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        {/* BARRA DE FILTROS (NUEVO) */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 h-8 text-xs ${filter === "all" ? "bg-white text-black hover:bg-zinc-200" : "bg-transparent border-zinc-800 text-zinc-400"}`}
          >
            Todas ({bookings.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={`rounded-full px-4 h-8 text-xs ${filter === "pending" ? "bg-yellow-600 text-white hover:bg-yellow-700" : "bg-transparent border-zinc-800 text-zinc-400"}`}
          >
            Pendientes
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            onClick={() => setFilter("confirmed")}
            className={`rounded-full px-4 h-8 text-xs ${filter === "confirmed" ? "bg-green-700 text-white hover:bg-green-800" : "bg-transparent border-zinc-800 text-zinc-400"}`}
          >
            Confirmadas
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className={`rounded-full px-4 h-8 text-xs ${filter === "completed" ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-transparent border-zinc-800 text-zinc-400"}`}
          >
            Completadas
          </Button>
          <Button
            variant={filter === "cancelled" ? "default" : "outline"}
            onClick={() => setFilter("cancelled")}
            className={`rounded-full px-4 h-8 text-xs ${filter === "cancelled" ? "bg-red-900/50 text-white hover:bg-red-900" : "bg-transparent border-zinc-800 text-zinc-400"}`}
          >
            Canceladas
          </Button>
        </div>

        {/* TABLA DE DATOS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">
                  Cliente & Ubicación
                </TableHead>
                <TableHead className="text-zinc-400 font-medium">
                  Servicio
                </TableHead>
                <TableHead className="text-zinc-400 font-medium">
                  Fecha & Hora
                </TableHead>
                <TableHead className="text-zinc-400 font-medium">
                  Estado
                </TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-zinc-500 h-32"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cargando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-zinc-500 h-32"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="h-8 w-8 opacity-20" />
                      <p>No hay citas en esta categoría.</p>
                      {filter !== "all" && (
                        <Button
                          variant="link"
                          onClick={() => setFilter("all")}
                          className="text-orange-500"
                        >
                          Ver todas
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-zinc-800 hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* COLUMNA 1: CLIENTE */}
                    <TableCell className="align-top py-4">
                      <div className="font-medium text-white text-base">
                        {booking.name}
                      </div>

                      {/* Enlace a WhatsApp directo */}
                      <a
                        href={`https://wa.me/52${booking.phone.replace(/\s+/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-green-500 hover:text-green-400 mt-1 font-medium transition-colors w-fit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-message-circle"
                        >
                          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                        </svg>
                        {booking.phone}
                      </a>

                      <div className="flex items-start gap-1.5 mt-3 text-xs text-zinc-400 leading-tight">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-orange-500/70 flex-shrink-0" />
                        <span>
                          {booking.address_street} {booking.address_number}
                          <br />
                          <span className="text-zinc-500">
                            {booking.address_colonia}
                          </span>
                        </span>
                      </div>
                    </TableCell>

                    {/* COLUMNA 2: SERVICIO */}
                    <TableCell className="align-top py-4">
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                      >
                        {booking.service_type}
                      </Badge>
                    </TableCell>

                    {/* COLUMNA 3: FECHA */}
                    <TableCell className="align-top py-4">
                      <div className="font-medium text-zinc-200">
                        {format(new Date(booking.booking_date), "EEE, d MMM", {
                          locale: es,
                        })}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-orange-400 mt-1 font-medium">
                        <Clock className="h-3.5 w-3.5" />{" "}
                        {booking.booking_time || "S/H"}
                      </div>
                    </TableCell>

                    {/* COLUMNA 4: ESTADO */}
                    <TableCell className="align-top py-4">
                      <Badge
                        className={`border ${getStatusColor(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </TableCell>

                    {/* COLUMNA 5: ACCIONES */}
                    <TableCell className="align-top py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-zinc-950 border-zinc-800 text-zinc-300 w-48"
                        >
                          <DropdownMenuLabel>Cambiar Estatus</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-zinc-800" />

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "confirmed")
                            }
                            className="hover:bg-zinc-900 hover:text-white cursor-pointer focus:bg-zinc-900 focus:text-white"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />{" "}
                            Confirmar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "completed")
                            }
                            className="hover:bg-zinc-900 hover:text-white cursor-pointer focus:bg-zinc-900 focus:text-white"
                          >
                            <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />{" "}
                            Completar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => updateStatus(booking.id, "pending")}
                            className="hover:bg-zinc-900 hover:text-white cursor-pointer focus:bg-zinc-900 focus:text-white"
                          >
                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />{" "}
                            Pendiente
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "cancelled")
                            }
                            className="text-red-500 hover:bg-red-950/30 hover:text-red-400 cursor-pointer focus:bg-red-950/30 focus:text-red-400"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Cancelar Cita
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
