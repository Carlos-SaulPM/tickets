import type { Metadata } from "next";

import "normalize.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tickets",
  description: "Front End de los tickets",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
