"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

export default function AdminCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  const blockSlot = async (time: string) => {
    if (!date) return;
    setLoading(true);

    const confirm = window.confirm(
      `¿Quieres BLOQUEAR el horario de las ${time} para el ${format(date, "d MMM")}?`,
    );
    if (!confirm) {
      setLoading(false);
      return;
    }

    // Creamos una reserva "falsa" para bloquear el horario
    const { error } = await supabase.from("bookings").insert([
      {
        name: "BLOQUEADO POR ADMIN",
        phone: "0000000000",
        email: "admin@bloqueo.com",
        service_type: "Bloqueo Administrativo",
        booking_date: date.toISOString(),
        booking_time: time,
        status: "blocked", // Usamos un status especial
        address_street: "-",
        address_number: "-",
        address_zip: "-",
        address_colonia: "-",
      },
    ]);

    if (error) alert("Error al bloquear: " + error.message);
    else alert("¡Horario bloqueado con éxito!");

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Gestión de Horarios</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Seleccionar Día */}
          <Card className="p-4 bg-zinc-900 border-zinc-800">
            <h2 className="text-white font-semibold mb-4">1. Elige el día</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="text-white rounded-md border border-zinc-800"
            />
          </Card>

          {/* Bloquear Horas */}
          <Card className="p-4 bg-zinc-900 border-zinc-800">
            <h2 className="text-white font-semibold mb-4">
              2. Bloquear horas del{" "}
              {date ? format(date, "d MMM", { locale: es }) : "día..."}
            </h2>
            <p className="text-zinc-400 text-xs mb-4">
              Haz clic en una hora para que NADIE pueda reservarla.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  onClick={() => blockSlot(slot)}
                  disabled={loading || !date}
                  className="bg-zinc-800 hover:bg-red-900 hover:text-red-200 border border-zinc-700"
                >
                  <Lock className="mr-2 h-3 w-3" />
                  {slot}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
