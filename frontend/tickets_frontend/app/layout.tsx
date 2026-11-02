import type { Metadata } from "next";

import "normalize.css";
import "./globals.css";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Tickets",
  description: "Front End de los tickets",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={cn("h-full", "antialiased", "font-sans", geist.variable)}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
