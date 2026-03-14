"use server";

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getBusyTimes } from "@/lib/calendar";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function generateGoogleCalendarLink(
  date: string,
  time: string,
  service: string,
  address: string,
  name: string,
) {
  const startDateTime = new Date(
    `${date.split("T")[0]} ${convertTo24Hour(time)}`,
  );
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

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

function convertTo24Hour(timeStr: string) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
  return `${hours}:${minutes}:00`;
}

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
    referral_code,
    vehicle_make,
    vehicle_model,
    vehicle_size,
    total_price,
  } = formData;

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
      referral_code: referral_code ? referral_code.toUpperCase() : null,
      vehicle_make,
      vehicle_model,
      total_price,
    },
  ]);

  if (dbError) {
    return {
      success: false,
      message: "Error guardando en base de datos: " + dbError.message,
    };
  }

  if (referral_code) {
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id, points")
      .eq("referral_code", referral_code.toUpperCase())
      .single();

    if (referrer) {
      await supabase
        .from("profiles")
        .update({ points: referrer.points + 1 })
        .eq("id", referrer.id);
    }
  }

  // 3. Preparar Link de Calendario
  const calendarLink = generateGoogleCalendarLink(
    booking_date,
    booking_time,
    service_type,
    `${address_street} ${address_number}, ${address_colonia}`,
    name,
  );

  // 4. Enviar Correo al Administrador
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "alexhdezf18@gmail.com",
      subject: `🎉 Nueva Reserva: ${service_type} - ${name}`,
      html: `
        <h1>¡Tienes un nuevo cliente! 🚗</h1>
        <p><strong>Cliente:</strong> ${name}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Servicio:</strong> ${service_type}</p>
        <p><strong>Fecha:</strong> ${new Date(booking_date).toLocaleDateString()}</p>
        <p><strong>Hora:</strong> ${booking_time}</p>
        <p><strong>Código de Referido usado:</strong> ${referral_code || "Ninguno"}</p>
        <hr />
        <p><strong>Dirección:</strong> ${address_street} ${address_number}, ${address_colonia}</p>
        <p><strong>Vehículo:</strong> ${vehicle_make} ${vehicle_model} (${vehicle_size})</p>
        <p><strong>Total a Pagar:</strong> $${total_price} MXN</p>
        <br />
        <a href="${calendarLink}" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          📅 Agregar a mi Google Calendar
        </a>
      `,
    });
  } catch (emailError) {
    console.error("Error enviando email:", emailError);
  }

  return { success: true, message: "Reserva creada y notificada" };
}

export async function checkAvailability(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const busySlots = await getBusyTimes(date);
    return { success: true, busySlots };
  } catch (error) {
    console.error("Error leyendo Google Calendar:", error);
    return { success: false, busySlots: [] };
  }
}
