"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

export function BotonNuevoTicket() {
  const { sesion } = useAuth();
  const pathname = usePathname();

  if (!sesion || pathname === "/tickets/nuevo") return null;

  return (
    <Link
      href="/tickets/nuevo"
      aria-label="Nuevo ticket"
      className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring fixed right-4 bottom-4 z-40 inline-flex h-14 items-center gap-2 rounded-full px-5 text-sm font-medium shadow-lg transition-colors focus-visible:ring-3 focus-visible:outline-none sm:right-6 sm:bottom-6"
    >
      <Plus className="size-5" aria-hidden />
      <span className="hidden sm:inline">Nuevo ticket</span>
    </Link>
  );
}
