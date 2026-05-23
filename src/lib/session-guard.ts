import { auth } from "./auth";
import { queryOne, table } from "./db";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type GuardResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse };

/**
 * Validates that the current session has not been replaced by a newer login.
 * Returns the session if valid, or a 401 NextResponse if the session was
 * invalidated because the user logged in from another device/browser.
 */
export async function guardSession(): Promise<GuardResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const dbUser = await queryOne<{ session_version: number }>(
    `SELECT session_version FROM ${table("users")} WHERE id = $1`,
    [session.user.id]
  );

  if (!dbUser) {
    return {
      session: null,
      error: NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 }),
    };
  }

  if (dbUser.session_version !== session.user.sessionVersion) {
    return {
      session: null,
      error: NextResponse.json(
        {
          error: "Sesión invalidada. Se detectó acceso desde otro dispositivo.",
          code: "SESSION_REPLACED",
        },
        { status: 401 }
      ),
    };
  }

  return { session: session as Session, error: null };
}
