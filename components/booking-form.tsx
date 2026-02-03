"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
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
import { useState, useEffect } from "react";

// --- DATOS DE PRUEBA PARA CHIHUAHUA (Simulación de API) ---
const CODIGOS_POSTALES_DEMO: Record<string, string> = {
  "31000": "Colonia Centro",
  "31109": "San Felipe",
  "31125": "Panamericana",
  "31203": "Campanario",
  "31215": "Paseos de Chihuahua",
  "31300": "Las Granjas",
  "31064": "Robinson",
};

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Requerido" }),
  phone: z.string().min(10, { message: "10 dígitos requeridos" }),
  email: z.string().email({ message: "Email inválido" }),
  service_type: z.string().min(1, { message: "Selecciona servicio" }),
  booking_date: z.date({ message: "Selecciona fecha" }),
  booking_time: z.string().min(1, { message: "Selecciona hora" }),

  // NUEVOS CAMPOS DE DIRECCIÓN
  address_zip: z.string().min(5, { message: "CP de 5 dígitos" }).max(5),
  address_colonia: z.string().min(1, { message: "Colonia requerida" }),
  address_street: z.string().min(1, { message: "Calle requerida" }),
  address_number: z.string().min(1, { message: "Número requerido" }),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // MAGIA: Escuchar cambios en el Código Postal
  const zipCode = form.watch("address_zip");

  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      // Intentamos buscar en nuestra "base de datos" local
      const coloniaEncontrada = CODIGOS_POSTALES_DEMO[zipCode];
      if (coloniaEncontrada) {
        form.setValue("address_colonia", coloniaEncontrada);
        // Aquí podrías agregar lógica para llenar Ciudad/Estado automáticamente también
      }
    }
  }, [zipCode, form]);

  const BUSINESS_PHONE = "526141234567"; // <--- NUMERO DE EJEMPLO

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // 1. Guardar en Supabase (Tu respaldo administrativo)
      const { error } = await supabase.from("bookings").insert([
        {
          name: values.name,
          phone: values.phone,
          email: values.email,
          service_type: values.service_type,
          booking_date: values.booking_date.toISOString(),
          booking_time: values.booking_time,
          address_street: values.address_street,
          address_number: values.address_number,
          address_zip: values.address_zip,
          address_colonia: values.address_colonia,
          address_city: "Chihuahua, CHIH",
        },
      ]);

      if (error) throw error;

      // 2. Preparar el mensaje de WhatsApp
      const fechaFormato = format(values.booking_date, "EEEE d 'de' MMMM", {
        locale: es,
      });

      const whatsappMessage = `Hola *Detailing SaaS*! 🚗✨
Quiero confirmar mi reserva que acabo de hacer en la web:

👤 *Cliente:* ${values.name}
🛠 *Servicio:* ${values.service_type}
📅 *Fecha:* ${fechaFormato}
⏰ *Hora:* ${values.booking_time}
📍 *Zona:* ${values.address_colonia}

¿Me confirman la disponibilidad?`;

      const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

      window.location.href = whatsappUrl;

      form.reset();
    } catch (error: any) {
      console.error("Error detallado:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-zinc-900/50 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-2xl">
      <div className="mb-8 text-center border-b border-zinc-800 pb-4">
        <h3 className="text-2xl font-bold text-white">Agenda tu Servicio</h3>
        <p className="text-zinc-400 text-sm">
          Déjanos tus datos y nosotros vamos a ti.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* SECCIÓN 1: CONTACTO */}
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

          {/* SECCIÓN 2: UBICACIÓN (ESTILO E-COMMERCE) */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 2. Ubicación del Vehículo
            </h4>

            {/* FILA 1: CP y Colonia (Auto-rellenable) */}
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

            {/* FILA 2: Calle y Número */}
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

          {/* SECCIÓN 3: CITA */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-orange-500 uppercase tracking-wider">
              3. Detalles del Servicio
            </h4>
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

            <div className="grid grid-cols-2 gap-4">
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
                          onSelect={field.onChange}
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

              {/* HORA */}
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
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
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
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 font-bold py-6 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
              </>
            ) : (
              "Confirmar Dirección y Cita"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
