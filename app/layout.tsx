import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Papotico's Wash | Detallado Automotriz a Domicilio",
  description:
    "Tu auto como nuevo, sin salir de casa. Servicio profesional de detallado automotriz en Chihuahua. Agenda tu lavado premium hoy mismo.",
  keywords: [
    "car wash",
    "detallado automotriz",
    "lavado a domicilio",
    "Chihuahua",
    "Papoticos Wash",
  ],
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="...">
        <Navbar />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
