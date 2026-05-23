"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-6 flex items-center gap-2 text-red-600 hover:text-red-700 transition"
    >
      <LogOut className="h-4 w-4" />
      Cerrar Sesión
    </button>
  );
}