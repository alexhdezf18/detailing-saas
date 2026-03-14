"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createBooking, checkAvailability } from "@/app/actions";
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
import { WeatherWidget } from "@/components/weather-widget";
import { Checkbox } from "@/components/ui/checkbox";

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

// 1. ZOD SCHEMA: Agregamos campos opcionales para la entrada manual
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
  referral_code: z.string().optional(),
  vehicle_make: z.string().min(1, { message: "Requerido" }),
  custom_make: z.string().optional(), // Campo manual para marca
  vehicle_model: z.string().min(1, { message: "Requerido" }),
  custom_model: z.string().optional(), // Campo manual para modelo
  trunk_vacuum: z.boolean(),
});

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] =
    useState<string[]>(DEFAULT_TIME_SLOTS);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);
  const [cargandoModelos, setCargandoModelos] = useState(false);

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
      referral_code: "",
      vehicle_make: "",
      custom_make: "",
      vehicle_model: "",
      custom_model: "",
      trunk_vacuum: false,
    },
  });

  const zipCode = form.watch("address_zip");
  const selectedDate = form.watch("booking_date");
  const selectedMake = form.watch("vehicle_make");
  const selectedModel = form.watch("vehicle_model");

  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      const colonia = CODIGOS_POSTALES_DEMO[zipCode];
      if (colonia) form.setValue("address_colonia", colonia);
    }
  }, [zipCode, form]);

  // Lógica de API modificada: Si elige "Otro", no llamamos a la API
  useEffect(() => {
    async function fetchModels() {
      if (!selectedMake) {
        setModelosDisponibles([]);
        return;
      }

      // Si selecciona "Otro", limpiamos modelos, pre-seleccionamos "Otro" en modelo y salimos
      if (selectedMake === "Otro") {
        setModelosDisponibles([]);
        form.setValue("vehicle_model", "Otro");
        return;
      }

      setCargandoModelos(true);
      form.setValue("vehicle_model", "");
      form.setValue("custom_model", ""); // Limpiamos el input manual por si acaso

      try {
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${selectedMake}?format=json`,
        );
        const data = await res.json();
        const models = data.Results.map((item: any) => item.Model_Name).sort();
        setModelosDisponibles(models);
      } catch (error) {
        console.error("Error cargando modelos:", error);
        toast.error("No se pudieron cargar los modelos");
      } finally {
        setCargandoModelos(false);
      }
    }

    fetchModels();
  }, [selectedMake, form]);

  // ... (El useEffect de fetchDisponibilidad de Supabase/Google queda exactamente igual) ...
  useEffect(() => {
    async function fetchDisponibilidad() {
      if (!selectedDate) return;
      setIsLoadingSlots(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        const { data: takenBookings } = await supabase
          .from("bookings")
          .select("booking_time")
          .gte("booking_date", startOfDay.toISOString())
          .lte("booking_date", endOfDay.toISOString())
          .neq("status", "cancelled");

        const takenTimes = takenBookings
          ? takenBookings.map((b) => b.booking_time)
          : [];
        const googleRes = await checkAvailability(startOfDay.toISOString());
        const googleEvents = googleRes.busySlots || [];

        const freeSlots = DEFAULT_TIME_SLOTS.filter((slot) => {
          if (takenTimes.includes(slot)) return false;
          const [time, period] = slot.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
          if (period === "PM" && hours !== 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
          const slotStart = new Date(selectedDate);
          slotStart.setHours(hours, minutes, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + 2 * 60 * 60 * 1000);

          const chocaConGoogle = googleEvents.some((evento: any) => {
            if (!evento.start || !evento.end) return false;
            const eventoInicio = new Date(evento.start);
            const eventoFin = new Date(evento.end);
            return slotStart < eventoFin && slotEnd > eventoInicio;
          });
          return !chocaConGoogle;
        });

        setAvailableSlots(freeSlots);
      } catch (error) {
        console.error("Error validando disponibilidad:", error);
        setAvailableSlots(DEFAULT_TIME_SLOTS);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchDisponibilidad();
  }, [selectedDate]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    // INTERCEPCIÓN DE PAYLOAD: Si seleccionó "Otro", usamos el texto manual
    const finalMake =
      values.vehicle_make === "Otro"
        ? values.custom_make || "No especificado"
        : values.vehicle_make;
    const finalModel =
      values.vehicle_model === "Otro"
        ? values.custom_model || "No especificado"
        : values.vehicle_model;

    try {
      const result = await createBooking({
        ...values,
        vehicle_make: finalMake, // Sobreescribimos con la marca final
        vehicle_model: finalModel, // Sobreescribimos con el modelo final
        booking_date: values.booking_date.toISOString(),
      });

      if (!result.success) throw new Error(result.message);

      const fechaFormato = format(values.booking_date, "EEEE d 'de' MMMM", {
        locale: es,
      });
      const trunkText = values.trunk_vacuum ? " (con aspirada de cajuela)" : "";

      const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(
        `Hola, quiero agendar un ${values.service_type} para mi ${finalMake} ${finalModel}${trunkText}. La fecha sería el ${fechaFormato} a las ${values.booking_time}. ¿Me confirmas la disponibilidad y el costo total?`,
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
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-zinc-900/50 backdrop-blur-lg rounded-xl border border-zinc-800 shadow-2xl">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Reserva Inteligente</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ==================== 1. PAQUETE Y VEHÍCULO ==================== */}
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <h4 className="text-sm font-semibold text-orange-500 uppercase">
              1. Paquete y Vehículo
            </h4>

            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Tipo de Lavado
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 h-14">
                        <SelectValue placeholder="Selecciona un paquete..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="FAST MODE">
                        Fast Mode (Mantenimiento)
                      </SelectItem>
                      <SelectItem value="DETAILING MODE">
                        Detailing Mode (Profundo)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MARCA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="vehicle_make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Marca</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue placeholder="Ej. Toyota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-48">
                          {[
                            "Audi",
                            "BMW",
                            "Chevrolet",
                            "Dodge",
                            "Ford",
                            "GMC",
                            "Honda",
                            "Hyundai",
                            "Jeep",
                            "Kia",
                            "Mazda",
                            "Mercedes-Benz",
                            "Nissan",
                            "Peugeot",
                            "Renault",
                            "Suzuki",
                            "Toyota",
                            "Volkswagen",
                          ].map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                          <SelectItem
                            value="Otro"
                            className="text-orange-400 font-bold"
                          >
                            Otra marca...
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* RENDERIZADO CONDICIONAL: Input manual de Marca */}
                {selectedMake === "Otro" && (
                  <FormField
                    control={form.control}
                    name="custom_make"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Escribe la marca"
                            {...field}
                            className="bg-zinc-950 border-orange-500/50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* MODELO */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="vehicle_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">
                        Modelo{" "}
                        {cargandoModelos && (
                          <Loader2 className="inline h-3 w-3 animate-spin text-orange-500" />
                        )}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedMake || cargandoModelos}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue
                              placeholder={
                                selectedMake ? "Modelo..." : "Elige marca"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-48">
                          {modelosDisponibles.map((model, index) => (
                            <SelectItem key={`${model}-${index}`} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                          {selectedMake && (
                            <SelectItem
                              value="Otro"
                              className="text-orange-400 font-bold"
                            >
                              Otro modelo...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* RENDERIZADO CONDICIONAL: Input manual de Modelo */}
                {selectedModel === "Otro" && (
                  <FormField
                    control={form.control}
                    name="custom_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Escribe el modelo"
                            {...field}
                            className="bg-zinc-950 border-orange-500/50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* CHECKBOX CAJUELA */}
            <FormField
              control={form.control}
              name="trunk_vacuum"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-zinc-800 p-4 bg-zinc-950">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-zinc-700 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-zinc-300">
                      Aspirada de cajuela (+ $30 MXN)
                    </FormLabel>
                    <p className="text-xs text-zinc-500">
                      Limpieza a detalle del maletero.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* FECHA Y HORA */}
            <div className="grid grid-cols-2 gap-4">
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
                            form.setValue("booking_time", "");
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <WeatherWidget date={field.value} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="booking_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">
                      Hora{" "}
                      {isLoadingSlots && (
                        <span className="text-orange-500 text-xs ml-2">
                          (...)
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
                              selectedDate ? "Horarios" : "Elige fecha"
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

          {/* ==================== 2. TUS DATOS ==================== */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-semibold text-orange-500 uppercase">
              2. Tus Datos
            </h4>
            <div className="grid grid-cols-2 gap-4">
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

          {/* ==================== 3. UBICACIÓN DEL VEHÍCULO ==================== */}
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-semibold text-orange-500 uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 3. Ubicación
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
                        placeholder="31000"
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

          {/* ==================== REFERIDO Y SUBMIT ==================== */}
          <div className="pt-4 border-t border-zinc-800">
            <FormField
              control={form.control}
              name="referral_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Código de Referido (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. CUU-A7X9"
                      {...field}
                      className="bg-zinc-950 border-zinc-800 text-orange-400 font-mono uppercase placeholder:normal-case"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 font-bold py-6 text-lg mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar en WhatsApp"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
