import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

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
    <html lang="es" className="dark"> {/* <--- 2. Forzamos modo oscuro */}
      <body className={`${inter.className} bg-black text-white antialiased`}> {/* 3. Fondo negro base */}
        <Navbar /> {/* <--- 4. Aquí colocamos el Navbar */}
        {children} {/* Aquí se renderizará page.tsx */}
      </body>
    </html>
  );
}