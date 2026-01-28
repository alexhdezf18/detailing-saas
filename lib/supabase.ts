import { createClient } from "@supabase/supabase-js";

// 1. Leemos las variables de entorno que acabas de configurar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. Creamos y exportamos la conexión ("el cliente")
// El signo de exclamación (!) le dice a TypeScript: "Confía en mí, estas variables SÍ existen"
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
