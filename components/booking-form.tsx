"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es muy corto." }),
  phone: z
    .string()
    .min(10, { message: "Ingresa un número válido de 10 dígitos." }),
  email: z.string().email({ message: "Correo inválido." }),

  service_type: z.string().min(1, {
    message: "Por favor selecciona un servicio.",
  }),

  booking_date: z.date({
    message: "¡Necesitamos saber cuándo ir!",
  }),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
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
        },
      ]);

      if (error) throw error;

      alert("¡Cita agendada! Revisa tu correo.");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-900/50 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-2xl">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Reserva tu Detallado</h3>
        <p className="text-zinc-400 text-sm mt-2">
          Elige el servicio y la fecha ideal.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
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
                    className="bg-zinc-950 border-zinc-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Teléfono y Email en una fila (Grid de 2 columnas) */}
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
                      className="bg-zinc-950 border-zinc-800"
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
                      className="bg-zinc-950 border-zinc-800"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SELECTOR DE SERVICIO (Nuevo) */}
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

          {/* CALENDARIO / DATE PICKER (Nuevo) */}
          <FormField
            control={form.control}
            name="booking_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-zinc-300">Fecha Deseada</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-zinc-950 border-zinc-800 hover:bg-zinc-900 hover:text-white",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona una fecha</span>
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
