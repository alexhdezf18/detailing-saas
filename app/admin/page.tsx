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
import { LogOut } from "lucide-react";

// ... (interface Booking se mantiene igual)
interface Booking {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  booking_date: string;
  status: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. EFECTO DE SEGURIDAD: Verificar si hay usuario
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Si no hay sesión, ¡fuera de aquí!
        router.push("/login");
      } else {
        // Si hay sesión, permitimos ver la página
        setIsAuthenticated(true);
      }
    }

    checkAuth();
  }, [router]);

  // 2. EFECTO DE DATOS: Cargar las citas (Solo si está autenticado)
  useEffect(() => {
    if (!isAuthenticated) return; // No cargar datos si no está logueado

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
  }, [isAuthenticated]); // Se ejecuta cuando isAuthenticated cambia a true

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Si no está autenticado, mostramos pantalla negra (o un loader) para evitar "parpadeos"
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Verificando acceso...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

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

            {/* Botón de Cerrar Sesión */}
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        {/* ... (La tabla sigue igual que antes) ... */}
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
          <Table>
            {/* ... Pega aquí el contenido de la tabla que ya tenías ... */}
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Cliente</TableHead>
                <TableHead className="text-zinc-400">Servicio</TableHead>
                <TableHead className="text-zinc-400">Fecha Cita</TableHead>
                <TableHead className="text-zinc-400">Contacto</TableHead>
                <TableHead className="text-zinc-400">Estado</TableHead>
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
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <Badge className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700">
                        {booking.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {format(
                        new Date(booking.booking_date),
                        "EEE, d MMM yyyy",
                        { locale: es },
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {booking.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900/50 text-yellow-500"
                        }
                      >
                        {booking.status === "pending"
                          ? "Pendiente"
                          : booking.status}
                      </Badge>
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
