"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, Clock } from "lucide-react"; // <--- Importamos Clock
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

// 1. Definimos los horarios disponibles (Slots)
const TIME_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

// 2. Actualizamos el esquema de validación
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  phone: z
    .string()
    .min(10, { message: "Ingresa un número válido de 10 dígitos." }),
  email: z.string().email({ message: "Correo inválido." }),
  service_type: z
    .string()
    .min(1, { message: "Por favor selecciona un servicio." }),
  booking_date: z.date({ message: "¡Necesitamos saber cuándo ir!" }),
  booking_time: z.string().min(1, { message: "Selecciona una hora." }), // <--- Nuevo campo
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      // Sin defaults para obligar a elegir
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          name: values.name,
          phone: values.phone,
          email: values.email,
          service_type: values.service_type,
          booking_date: values.booking_date.toISOString(),
          booking_time: values.booking_time, // <--- Enviamos la hora
        },
      ]);

      if (error) throw error;

      alert("¡Cita agendada! Revisa tu correo.");
      form.reset();
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert(`Error: ${error.message || "Hubo un error al guardar."}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900/50 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-2xl">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Reserva tu Detallado</h3>
        <p className="text-zinc-400 text-sm mt-2">
          Elige el servicio, la fecha y la hora.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tu nombre"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="614..."
                      {...field}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="@gmail.com"
                      {...field}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300">Paquete</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                      <SelectValue placeholder="Selecciona un paquete" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="Lavado Express">
                      Lavado Express ($350)
                    </SelectItem>
                    <SelectItem value="Detallado Premium">
                      Detallado Premium ($950)
                    </SelectItem>
                    <SelectItem value="Cerámico Total">
                      Cerámico Total ($2,500)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* FECHA Y HORA EN LA MISMA FILA */}
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Selector de Fecha */}
            <FormField
              control={form.control}
              name="booking_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-zinc-300">Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white text-white",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMM", { locale: es })
                          ) : (
                            <span>Elegir día</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-zinc-900 border-zinc-800"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Selector de Hora (Nuevo) */}
            <FormField
              control={form.control}
              name="booking_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Hora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300">
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agendando...
              </>
            ) : (
              "Confirmar Reserva"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
