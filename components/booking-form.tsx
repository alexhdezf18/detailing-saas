"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createBooking } from "@/app/actions";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";

// --- CONFIGURACIÓN ---
// Tus horarios estándar de trabajo
const DEFAULT_TIME_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
  "05:00 PM",
];

const CODIGOS_POSTALES_DEMO: Record<string, string> = {
  "31000": "Colonia Centro",
  "31109": "San Felipe",
  "31125": "Panamericana",
  "31203": "Campanario",
  "31215": "Paseos de Chihuahua",
  "31300": "Las Granjas",
  "31064": "Robinson",
};

const BUSINESS_PHONE = "6142730355";

const formSchema = z.object({
  name: z.string().min(2, { message: "Requerido" }),
  phone: z.string().min(10, { message: "10 dígitos requeridos" }),
  email: z.string().email({ message: "Email inválido" }),
  service_type: z.string().min(1, { message: "Selecciona servicio" }),
  booking_date: z.date({ message: "Selecciona fecha" }),
  booking_time: z.string().min(1, { message: "Selecciona hora" }),
  address_zip: z.string().min(5).max(5),
  address_colonia: z.string().min(1),
  address_street: z.string().min(1),
  address_number: z.string().min(1),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] =
    useState<string[]>(DEFAULT_TIME_SLOTS);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address_zip: "",
      address_colonia: "",
      address_street: "",
      address_number: "",
    },
  });

  const zipCode = form.watch("address_zip");
  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      const colonia = CODIGOS_POSTALES_DEMO[zipCode];
      if (colonia) form.setValue("address_colonia", colonia);
    }
  }, [zipCode, form]);

  const selectedDate = form.watch("booking_date");

  useEffect(() => {
    async function checkAvailability() {
      if (!selectedDate) return;

      setIsLoadingSlots(true);

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: takenBookings } = await supabase
        .from("bookings")
        .select("booking_time")
        .gte("booking_date", startOfDay.toISOString())
        .lte("booking_date", endOfDay.toISOString())
        .neq("status", "cancelled");
      if (takenBookings) {
        const takenTimes = takenBookings.map((b) => b.booking_time);

        const freeSlots = DEFAULT_TIME_SLOTS.filter(
          (slot) => !takenTimes.includes(slot),
        );
        setAvailableSlots(freeSlots);
      }
      setIsLoadingSlots(false);
    }

    checkAvailability();
  }, [selectedDate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const result = await createBooking({
        ...values,
        booking_date: values.booking_date.toISOString(),
      });

      if (!result.success) throw new Error(result.message);

      const fechaFormato = format(values.booking_date, "EEEE d 'de' MMMM", {
        locale: es,
      });

      const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(
        `Hola, quiero confirmar mi reserva para el ${fechaFormato} a las ${values.booking_time}.`,
      )}`;

      toast.success("¡Reserva Agendada!", {
        description: "Te estamos redirigiendo a WhatsApp para confirmar...",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.href = whatsappUrl;
        form.reset();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast.error("Hubo un error", {
        description: error.message || "No se pudo conectar con el servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-zinc-900/50 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-2xl">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Reserva Inteligente</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ... (Secciones de Contacto y Dirección se mantienen igual) ... */}
          {/* SOLO PONDRÉ AQUÍ LA SECCIÓN DE CITA QUE CAMBIÓ VISUALMENTE */}

          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <h4 className="text-sm font-semibold text-orange-500 uppercase">
              Detalles de la Cita
            </h4>

            {/* SERVICIO (Igual que antes) */}
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
                      <SelectTrigger className="bg-zinc-950 border-zinc-800">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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

            <div className="grid md:grid-cols-2 gap-4">
              {/* CALENDARIO */}
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
                              "w-full pl-3 text-left font-normal bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-white",
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
                          onSelect={(date) => {
                            field.onChange(date);
                            form.setValue("booking_time", ""); // Resetear hora al cambiar día
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* HORA INTELIGENTE */}
              <FormField
                control={form.control}
                name="booking_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      Hora{" "}
                      {isLoadingSlots && (
                        <span className="text-orange-500 text-xs ml-2">
                          (Buscando...)
                        </span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedDate || isLoadingSlots}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                          <SelectValue
                            placeholder={
                              selectedDate
                                ? "Ver horarios"
                                : "Primero elige fecha"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-zinc-500 text-center">
                            ¡Día lleno!
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* RESTO DEL FORMULARIO OCULTO PARA BREVEDAD (NOMBRE, DIRECCIÓN) - DEBES MANTENERLO */}
          {/* Asegúrate de pegar las secciones de "Tus Datos" y "Ubicación" que ya tenías aquí antes del botón */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              1. Tus Datos
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Nombre</FormLabel>
                    <FormControl>
                      <Input
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-zinc-950 border-zinc-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Email</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-zinc-950 border-zinc-800" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 2. Ubicación del Vehículo
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address_zip"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-zinc-300">C.P.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="31..."
                        maxLength={5}
                        {...field}
                        className="bg-zinc-950 border-zinc-800 text-white font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_colonia"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-zinc-300">Colonia</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Centro"
                        {...field}
                        className="bg-zinc-950 border-zinc-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="address_street"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel className="text-zinc-300">Calle</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Av. Universidad"
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
                name="address_number"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel className="text-zinc-300">Número</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="#123"
                        {...field}
                        className="bg-zinc-950 border-zinc-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 font-bold py-6 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar en WhatsApp"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
