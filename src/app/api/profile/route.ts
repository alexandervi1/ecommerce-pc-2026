import { NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import { guardSession } from "@/lib/session-guard";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PASSWORD_RULES } from "@/lib/schemas";

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual requerida"),
  newPassword: z
    .string()
    .min(PASSWORD_RULES.min, `La contraseña debe tener al menos ${PASSWORD_RULES.min} caracteres`)
    .regex(PASSWORD_RULES.uppercase, "Debe contener al menos una mayúscula")
    .regex(PASSWORD_RULES.lowercase, "Debe contener al menos una minúscula")
    .regex(PASSWORD_RULES.number, "Debe contener al menos un número")
    .regex(PASSWORD_RULES.special, "Debe contener al menos un carácter especial"),
});

export async function GET() {
  try {
    const { session, error } = await guardSession();
    if (error) return error;

    const user = await query(
      'SELECT id, name, email, phone, "createdAt" FROM users WHERE id = $1',
      [session.user.id]
    );

    if (user.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { session, error } = await guardSession();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const body = await request.json();

    if (type === "password") {
      const data = changePasswordSchema.parse(body);

      const user = await query(
        'SELECT password FROM users WHERE id = $1',
        [session.user.id]
      ) as { password: string }[];

      if (user.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(data.currentPassword, user[0].password);

      if (!isValid) {
        return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await execute(
        'UPDATE users SET password = $1, "updatedAt" = NOW() WHERE id = $2',
        [hashedPassword, session.user.id]
      );

      return NextResponse.json({ success: true, message: "Contraseña actualizada" });
    } else {
      const data = updateProfileSchema.parse(body);

      const updates: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        params.push(data.name);
      }
      if (data.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        params.push(data.phone);
      }

      if (updates.length === 0) {
        return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
      }

      updates.push(`"updatedAt" = NOW()`);
      params.push(session.user.id);

      await execute(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
        params
      );

      const user = await query(
        'SELECT id, name, email, phone FROM users WHERE id = $1',
        [session.user.id]
      );

      return NextResponse.json(user[0]);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}