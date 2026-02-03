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
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      alert("Error al actualizar. Recarga la página.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900 text-green-300 hover:bg-green-900";
      case "completed":
        return "bg-blue-900 text-blue-300 hover:bg-blue-900";
      case "cancelled":
        return "bg-red-900 text-red-300 hover:bg-red-900";
      default:
        return "bg-yellow-900/50 text-yellow-500 hover:bg-yellow-900/50";
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Verificando acceso...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Gestiona tus reservas activas
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <Badge
              variant="outline"
              className="text-zinc-400 border-zinc-700 h-9 px-4"
            >
              {bookings.length} Citas
            </Badge>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Cliente</TableHead>
                <TableHead className="text-zinc-400">Servicio</TableHead>
                <TableHead className="text-zinc-400">Fecha Cita</TableHead>
                <TableHead className="text-zinc-400">Estado</TableHead>
                <TableHead className="text-zinc-400 text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-white h-24"
                  >
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-zinc-500 h-24"
                  >
                    No hay citas.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-medium text-white">
                      {booking.name}
                      <div className="text-xs text-zinc-500">
                        {booking.email}
                      </div>
                      <div className="text-xs text-zinc-500 md:hidden">
                        {booking.phone}
                      </div>
                    </TableCell>

                    <TableCell className="text-zinc-300">
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 border-zinc-700"
                      >
                        {booking.service_type}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-zinc-300">
                      <div className="font-medium">
                        {format(new Date(booking.booking_date), "EEE, d MMM", {
                          locale: es,
                        })}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                        <Clock className="h-3 w-3" />{" "}
                        {booking.booking_time || "S/H"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                          >
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-zinc-900 border-zinc-800 text-zinc-300"
                        >
                          <DropdownMenuLabel>Cambiar Estatus</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-zinc-800" />

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "confirmed")
                            }
                            className="hover:bg-zinc-800 cursor-pointer"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />{" "}
                            Confirmar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "completed")
                            }
                            className="hover:bg-zinc-800 cursor-pointer"
                          >
                            <CheckSquare className="mr-2 h-4 w-4 text-blue-500" />{" "}
                            Completar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => updateStatus(booking.id, "pending")}
                            className="hover:bg-zinc-800 cursor-pointer"
                          >
                            <Clock className="mr-2 h-4 w-4 text-yellow-500" />{" "}
                            Pendiente
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          <DropdownMenuItem
                            onClick={() =>
                              updateStatus(booking.id, "cancelled")
                            }
                            className="text-red-500 hover:bg-zinc-800 hover:text-red-400 cursor-pointer"
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
