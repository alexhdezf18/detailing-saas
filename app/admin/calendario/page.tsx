"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Lock, Unlock, Sun } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const TODAS_LAS_HORAS = [
  "05:00 AM",
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

const HORARIO_BASE: Record<number, string[]> = {
  0: [],
  1: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"],
  2: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"],
  3: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"],
  4: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"],
  5: ["03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"],
  6: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"],
};

export default function AdminCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  const [dbExceptions, setDbExceptions] = useState<
    { time: string; status: string }[]
  >([]);

  useEffect(() => {
    if (!date) return;
    const fetchBlocks = async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time, status")
        .in("status", ["blocked", "unlocked"])
        .gte("booking_date", startOfDay.toISOString())
        .lte("booking_date", endOfDay.toISOString());

      if (error) {
        console.error("Error cargando horarios:", error);
      } else if (data) {
        setDbExceptions(
          data.map((d) => ({ time: d.booking_time, status: d.status })),
        );
      }
    };
    fetchBlocks();
  }, [date]);

  const toggleSlot = async (time: string) => {
    if (!date) return;
    setLoading(true);

    const dayOfWeek = date.getDay();
    const esNativo = HORARIO_BASE[dayOfWeek].includes(time);
    const exceptionRecord = dbExceptions.find((e) => e.time === time);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      if (esNativo) {
        if (exceptionRecord?.status === "blocked") {
          const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("status", "blocked")
            .eq("booking_time", time)
            .gte("booking_date", startOfDay.toISOString())
            .lte("booking_date", endOfDay.toISOString());

          if (error) throw error;
          setDbExceptions((prev) => prev.filter((e) => e.time !== time));
        } else {
          // ✅ FIX: Se eliminó trunk_vacuum
          const { error } = await supabase.from("bookings").insert([
            {
              name: "EXCEPCIÓN - BLOQUEO",
              phone: "0",
              email: "admin@bloqueo.com",
              service_type: "Admin",
              booking_date: date.toISOString(),
              booking_time: time,
              status: "blocked",
              address_street: "-",
              address_number: "-",
              address_zip: "-",
              address_colonia: "-",
              vehicle_make: "-",
              vehicle_model: "-",
            },
          ]);

          if (error) throw error;
          setDbExceptions((prev) => [...prev, { time, status: "blocked" }]);
        }
      } else {
        if (exceptionRecord?.status === "unlocked") {
          const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("status", "unlocked")
            .eq("booking_time", time)
            .gte("booking_date", startOfDay.toISOString())
            .lte("booking_date", endOfDay.toISOString());

          if (error) throw error;
          setDbExceptions((prev) => prev.filter((e) => e.time !== time));
        } else {
          // ✅ FIX: Se eliminó trunk_vacuum
          const { error } = await supabase.from("bookings").insert([
            {
              name: "EXCEPCIÓN - APERTURA",
              phone: "0",
              email: "admin@apertura.com",
              service_type: "Admin",
              booking_date: date.toISOString(),
              booking_time: time,
              status: "unlocked",
              address_street: "-",
              address_number: "-",
              address_zip: "-",
              address_colonia: "-",
              vehicle_make: "-",
              vehicle_model: "-",
            },
          ]);

          if (error) throw error;
          setDbExceptions((prev) => [...prev, { time, status: "unlocked" }]);
        }
      }
    } catch (error: any) {
      console.error("Error crítico al modificar horario:", error);
      toast.error("Error en la Base de Datos", {
        description: error.message || "No se pudo guardar el cambio.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-700 hover:bg-zinc-800 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Gestión de Horarios Base y Excepciones
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-xl">
            <h2 className="text-white font-semibold mb-4 text-lg">
              1. Elige la fecha
            </h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={es}
                className="text-white rounded-md border border-zinc-800 bg-zinc-950 p-4"
              />
            </div>
          </Card>

          <Card className="p-6 bg-zinc-900 border-zinc-800 shadow-xl">
            <div className="mb-6">
              <h2 className="text-white font-semibold text-lg">
                2. Control manual del{" "}
                <span className="text-orange-500">
                  {date ? format(date, "EEEE d", { locale: es }) : "día..."}
                </span>
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Horas base disponibles (Sin color). Bloquéalas por emergencias
                (Rojo) o habilita horas extras fuera de tu turno (Naranja).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {date &&
                TODAS_LAS_HORAS.map((slot) => {
                  const dayOfWeek = date.getDay();
                  const esNativo = HORARIO_BASE[dayOfWeek].includes(slot);
                  const isBlockedException = dbExceptions.some(
                    (e) => e.time === slot && e.status === "blocked",
                  );
                  const isUnlockedException = dbExceptions.some(
                    (e) => e.time === slot && e.status === "unlocked",
                  );

                  let buttonStyle = "";
                  let Icon = Unlock;

                  if (esNativo) {
                    if (isBlockedException) {
                      buttonStyle =
                        "bg-red-950/50 border-red-900/50 text-red-200 hover:bg-red-900";
                      Icon = Lock;
                    } else {
                      buttonStyle =
                        "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700";
                      Icon = Unlock;
                    }
                  } else {
                    if (isUnlockedException) {
                      buttonStyle =
                        "bg-orange-900/40 border-orange-500/50 text-orange-400 hover:bg-orange-800/60";
                      Icon = Sun;
                    } else {
                      buttonStyle =
                        "bg-zinc-950 border-zinc-900 text-zinc-600 hover:bg-zinc-900 opacity-50";
                      Icon = Lock;
                    }
                  }

                  return (
                    <Button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      disabled={loading}
                      className={`transition-all h-12 font-medium border ${buttonStyle}`}
                    >
                      <Icon className="mr-2 h-3 w-3" />
                      {slot}
                    </Button>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
