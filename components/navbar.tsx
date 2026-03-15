"use client";

import Link from "next/link";
import Image from "next/image";
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
import {
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  Menu,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const ADMIN_EMAIL = "alexhdezf18@gmail.com";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleScrollToPrecios = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const preciosSection = document.getElementById("precios");
      if (preciosSection) {
        preciosSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          className="flex items-center gap-3 font-extrabold text-xl text-white tracking-tight group"
          href="/"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-orange-500/20 shadow-lg shadow-orange-500/10 transition-transform group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="Logo Papotico's Wash"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>

          <div className="hidden sm:flex items-baseline gap-1">
            <span className="text-orange-500 lowercase">papotico's</span>
            <span className="uppercase tracking-widest text-xs text-zinc-300">
              wash
            </span>
          </div>
        </Link>

        <nav className="hidden gap-8 md:flex items-center">
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-orange-500 cursor-pointer"
            href="/#precios"
            onClick={handleScrollToPrecios}
          >
            Precios
          </Link>
          <Link
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-orange-500"
            href="/reservar"
          >
            Reservar
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-orange-500 transition-all"
                >
                  <Avatar className="h-9 w-9 bg-zinc-900">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email || "Usuario"}
                    />
                    <AvatarFallback className="bg-orange-600 font-bold text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 bg-zinc-900/95 backdrop-blur-md border-zinc-800 text-zinc-300 mt-2"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold leading-none text-white">
                      {user.user_metadata?.full_name || "Cliente Papotico's"}
                    </p>
                    <p className="text-xs leading-none text-zinc-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800/80 hover:text-white cursor-pointer py-2.5"
                >
                  <Link href="/mis-reservas">
                    <CalendarCheck className="mr-2 h-4 w-4 text-orange-500" />{" "}
                    Mis Citas
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800/80 hover:text-white cursor-pointer py-2.5"
                >
                  <Link href="/perfil">
                    <UserIcon className="mr-2 h-4 w-4 text-orange-500" /> Mi
                    Perfil
                  </Link>
                </DropdownMenuItem>

                {user.email === ADMIN_EMAIL && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer py-2.5"
                    >
                      <Link href="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Panel de
                        Control
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* --- BOTONES PARA INVITADOS --- */
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800 font-medium"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/reservar">
                <Button className="bg-orange-600 text-white hover:bg-orange-700 font-bold shadow-lg shadow-orange-500/20 px-3 sm:px-4 text-sm sm:text-base">
                  Agendar Cita
                </Button>
              </Link>
            </div>
          )}

          {/* ==================== MENÚ HAMBURGUESA (MÓVIL) ==================== */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-900 border-zinc-800 text-white mt-2"
              >
                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800 cursor-pointer py-3"
                >
                  <Link href="/#precios" onClick={handleScrollToPrecios}>
                    Precios
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="hover:bg-zinc-800 cursor-pointer py-3"
                >
                  <Link href="/reservar">Reservar</Link>
                </DropdownMenuItem>

                {!user && (
                  <>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-zinc-800 cursor-pointer py-3"
                    >
                      <Link
                        href="/login"
                        className="text-orange-400 font-medium w-full"
                      >
                        Iniciar Sesión
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
