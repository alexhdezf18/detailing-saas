"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

// 1. Esquema de validación con Zod
// Aquí definimos qué es válido y qué no.
const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 letras.",
  }),
  phone: z.string().min(10, {
    message: "Por favor ingresa un número de celular válido (10 dígitos).",
  }),
  email: z.string().email({
    message: "Ingresa un correo electrónico válido.",
  }),
  service_type: z.string().min(1, {
    message: "Por favor selecciona un servicio.",
  }),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service_type: "Lavado Express", // Valor por defecto
    },
  });

  // 3. Función que se ejecuta cuando el usuario envía el formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // AQUÍ OCURRE LA MAGIA DE SUPABASE
      const { error } = await supabase
        .from("bookings") // Nombre de la tabla
        .insert([
          {
            name: values.name,
            phone: values.phone,
            email: values.email,
            service_type: values.service_type,
            booking_date: new Date().toISOString(), // Por ahora fecha automática hoy
          },
        ]);

      if (error) throw error;

      alert("¡Reserva enviada con éxito! Te contactaremos pronto.");
      form.reset(); // Limpiar formulario
    } catch (error) {
      console.error("Error enviando reserva:", error);
      alert("Hubo un error al enviar tu reserva. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <h3 className="text-xl font-bold text-white mb-4">Agenda tu cita</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo: Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nombre Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Juan Pérez"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Teléfono */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">
                  Teléfono / WhatsApp
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="614 123 4567"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo: Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="juan@ejemplo.com"
                    {...field}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Confirmar Reserva"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
