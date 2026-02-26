"use client"; // <--- Importante

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Ver si ya hay usuario al cargar
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // 2. Escuchar cambios (login/logout) en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* LOGO */}
        <Link
          className="flex items-center gap-2 font-bold text-xl text-white"
          href="/"
        >
          <span className="text-orange-500">Detailing</span>SaaS
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden gap-6 md:flex items-center">
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            href="/#precios"
          >
            Precios
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            href="/reservar"
          >
            Reservar
          </Link>
        </nav>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-4">
          {user ? (
            // --- USUARIO LOGUEADO ---
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9 border border-zinc-700">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || ""}
                    />
                    <AvatarFallback className="bg-orange-600 text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300"
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user.user_metadata?.full_name}
                    </p>
                    <p className="text-xs leading-none text-zinc-500">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800 cursor-pointer"
                >
                  <Link href="/perfil">
                    <UserIcon className="mr-2 h-4 w-4" /> Mi Perfil
                  </Link>
                </DropdownMenuItem>

                {/* Solo mostramos Panel Admin si es tu correo */}
                {/* Puedes ajustar esta lógica más tarde con roles reales */}
                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800 cursor-pointer"
                >
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Panel Admin
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-red-950/30 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // --- USUARIO NO LOGUEADO ---
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/reservar">
                <Button className="bg-orange-600 text-white hover:bg-orange-700">
                  Reservar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
