import type { Metadata } from "next";

import "./globals.css";

import { Geist } from "next/font/google";

import { BotonNuevoTicket } from "@/components/tickets/boton-nuevo-ticket";
import { Toaster } from "@/components/ui/sonner";
import { DESCRIPCION_SISTEMA, NOMBRE_SISTEMA } from "@/lib/marca";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: NOMBRE_SISTEMA,
  description: DESCRIPCION_SISTEMA,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={cn("h-full", "antialiased", "font-sans", geist.variable)}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="bg-background focus:ring-ring sr-only rounded border px-3 py-2 text-sm focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:ring-2"
        >
          Saltar al contenido
        </a>
        {children}
        <BotonNuevoTicket />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
