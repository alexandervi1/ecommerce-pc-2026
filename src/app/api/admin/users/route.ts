import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    if (id) {
      const user = await query(
        `SELECT id, name, email, role, "createdAt" FROM users WHERE id = $1`,
        [id]
      );
      if (user.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      return NextResponse.json(user[0]);
    }

    let sql = `SELECT id, name, email, role, "createdAt", 
               (SELECT COUNT(*) FROM orders WHERE "userId" = users.id) as "orderCount"
               FROM users WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    sql += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(data.role);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    updates.push(`"updatedAt" = NOW()`);
    params.push(id);

    await execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    const user = await query(
      `SELECT id, name, email, role, "createdAt" FROM users WHERE id = $1`,
      [id]
    );
    if (user.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
    }

    await execute("DELETE FROM users WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}