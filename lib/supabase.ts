import { createBrowserClient } from "@supabase/ssr";

// Creamos el cliente usando la nueva librería que maneja las cookies automáticamente
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
