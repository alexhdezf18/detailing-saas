import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});

const calendar = google.calendar({ version: "v3", auth });

export async function getBusyTimes(date: Date) {
  const inicioDia = new Date(date);
  inicioDia.setHours(0, 0, 0, 0);

  const finDia = new Date(date);
  finDia.setHours(23, 59, 59, 999);

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: inicioDia.toISOString(),
    timeMax: finDia.toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items;

  if (!events || events.length === 0) {
    return [];
  }

  const busySlots = events.map((event) => {
    return {
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
    };
  });

  return busySlots;
}
