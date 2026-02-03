"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns"; // Para las fechas
import { es } from "date-fns/locale"; // Español
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Etiquetas bonitas
import { Navbar } from "@/components/navbar";

// Definimos la "forma" de una Reserva (TypeScript)
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Esta función se ejecuta automáticamente al entrar a la página
  useEffect(() => {
    async function fetchBookings() {
      try {
        // Petición a Supabase: Dame todo (*) de la tabla 'bookings'
        // Ordenado por fecha de creación descendente (lo más nuevo arriba)
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setBookings(data);
        }
      } catch (error) {
        console.error("Error cargando citas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Panel de Administración
          </h1>
          <Badge variant="outline" className="text-zinc-400 border-zinc-700">
            {bookings.length} Citas Totales
          </Badge>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
          <Table>
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
                // Mensaje de carga
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-white h-24"
                  >
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                // Mensaje si no hay datos
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-zinc-500 h-24"
                  >
                    No hay citas agendadas todavía.
                  </TableCell>
                </TableRow>
              ) : (
                // Renderizado de las filas con datos reales
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
                      {/* Formato: "Lun, 25 Ene" */}
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
                      {/* Lógica simple para colores de estado */}
                      <Badge
                        className={
                          booking.status === "confirmed"
                            ? "bg-green-900 text-green-300 hover:bg-green-900"
                            : "bg-yellow-900/50 text-yellow-500 hover:bg-yellow-900/50"
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
