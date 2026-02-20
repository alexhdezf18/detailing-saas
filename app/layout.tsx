import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Detailing SaaS",
  description: "Plataforma de reservaciones para detallado automotriz",
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
