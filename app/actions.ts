"use server";

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Necesitamos un cliente de Supabase con permisos de admin para insertar desde el servidor
// O usamos las variables públicas si tenemos RLS configurado para permitir inserts públicos (que ya lo hicimos)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para generar el link de Google Calendar
function generateGoogleCalendarLink(
  date: string,
  time: string,
  service: string,
  address: string,
  name: string,
) {
  // 1. Calcular fechas inicio y fin
  // Asumimos que el servicio dura 2 horas aprox para el calendario
  const startDateTime = new Date(
    `${date.split("T")[0]} ${convertTo24Hour(time)}`,
  );
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // +2 horas

  const formatGoogleDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🚗 Detallado: ${service} (${name})`,
    dates: `${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}`,
    details: `Cliente: ${name}\nDirección: ${address}\nServicio: ${service}`,
    location: address,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Auxiliar para convertir "03:00 PM" a "15:00"
function convertTo24Hour(timeStr: string) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours}:${minutes}:00`;
}

// --- LA ACCIÓN PRINCIPAL ---
export async function createBooking(formData: any) {
  const {
    name,
    phone,
    email,
    service_type,
    booking_date,
    booking_time,
    address_zip,
    address_colonia,
    address_street,
    address_number,
  } = formData;

  // 1. Guardar en Supabase
  const { error: dbError } = await supabase.from("bookings").insert([
    {
      name,
      phone,
      email,
      service_type,
      booking_date,
      booking_time,
      address_zip,
      address_colonia,
      address_street,
      address_number,
      address_city: "Chihuahua, CHIH",
      status: "pending",
    },
  ]);

  if (dbError) {
    return {
      success: false,
      message: "Error guardando en base de datos: " + dbError.message,
    };
  }

  // 2. Preparar Link de Calendario
  const calendarLink = generateGoogleCalendarLink(
    booking_date,
    booking_time,
    service_type,
    `${address_street} ${address_number}, ${address_colonia}`,
    name,
  );

  // 3. Enviar Correo al Administrador (A TI)
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Correo de prueba de Resend
      to: "alexhdezf18@gmail.com",
      subject: `🎉 Nueva Reserva: ${service_type} - ${name}`,
      html: `
        <h1>¡Tienes un nuevo cliente! 🚗</h1>
        <p><strong>Cliente:</strong> ${name}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Servicio:</strong> ${service_type}</p>
        <p><strong>Fecha:</strong> ${new Date(booking_date).toLocaleDateString()}</p>
        <p><strong>Hora:</strong> ${booking_time}</p>
        <hr />
        <p><strong>Dirección:</strong> ${address_street} ${address_number}, ${address_colonia}</p>
        <br />
        <a href="${calendarLink}" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          📅 Agregar a mi Google Calendar
        </a>
      `,
    });
  } catch (emailError) {
    console.error("Error enviando email:", emailError);
    // No fallamos la reserva si falla el email, solo lo registramos
  }

  return { success: true, message: "Reserva creada y notificada" };
}
