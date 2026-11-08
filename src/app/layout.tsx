import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioteca | Autores y libros",
  description: "Sistema de biblioteca con autores, libros, búsqueda y paginación",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="relative min-h-screen overflow-x-hidden antialiased">
        {/* Formas suaves de fondo con movimiento lento */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="animate-drift absolute -left-24 top-40 h-72 w-72 rounded-full bg-lilac/70" />
          <div
            className="animate-drift absolute -right-20 top-[60%] h-80 w-80 rounded-full bg-peach/60"
            style={{ animationDelay: "-6s" }}
          />
          <div
            className="animate-drift absolute left-1/3 -bottom-24 h-64 w-64 rounded-full bg-mint/60"
            style={{ animationDelay: "-3s" }}
          />
        </div>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
