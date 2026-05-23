import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, queryOne, execute, table } from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").regex(/^[a-z0-9-]+$/, "El slug solo puede tener letras minúsculas, números y guiones"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updateCategorySchema = categorySchema.partial();

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");

    if (id) {
      const category = await queryOne(
        `SELECT c.*, COUNT(p.id)::int as "productCount"
         FROM ${table("categories")} c
         LEFT JOIN ${table("products")} p ON p."categoryId" = c.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [id]
      );
      if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
      return NextResponse.json(category);
    }

    let sql = `SELECT c.*, COUNT(p.id)::int as "productCount"
               FROM ${table("categories")} c
               LEFT JOIN ${table("products")} p ON p."categoryId" = c.id
               WHERE 1=1`;
    const params: unknown[] = [];
    let idx = 1;

    if (search) {
      sql += ` AND (c.name ILIKE $${idx} OR c.slug ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` GROUP BY c.id ORDER BY c.name`;

    const categories = await query(sql, params);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = categorySchema.parse(body);

    const existing = await queryOne(
      `SELECT id FROM ${table("categories")} WHERE slug = $1`,
      [data.slug]
    );
    if (existing) {
      return NextResponse.json({ error: "Ya existe una categoría con ese slug" }, { status: 409 });
    }

    const id = uuidv4();
    await execute(
      `INSERT INTO ${table("categories")} (id, name, slug, description, image, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [id, data.name, data.slug, data.description || null, data.image || null, data.isActive]
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await request.json();
    const data = updateCategorySchema.parse(body);

    if (data.slug) {
      const existing = await queryOne(
        `SELECT id FROM ${table("categories")} WHERE slug = $1 AND id != $2`,
        [data.slug, id]
      );
      if (existing) {
        return NextResponse.json({ error: "Ya existe una categoría con ese slug" }, { status: 409 });
      }
    }

    const fields = Object.entries(data)
      .filter(([, v]) => v !== undefined)
      .map(([k], i) => `"${k}" = $${i + 2}`);

    if (fields.length === 0) return NextResponse.json({ error: "Sin cambios" }, { status: 400 });

    const values = Object.values(data).filter((v) => v !== undefined);

    await execute(
      `UPDATE ${table("categories")} SET ${fields.join(", ")}, "updatedAt" = NOW() WHERE id = $1`,
      [id, ...values]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("PUT /api/admin/categories error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const productCount = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${table("products")} WHERE "categoryId" = $1`,
      [id]
    );
    if (parseInt(productCount?.count || "0") > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría que tiene productos asignados" },
        { status: 409 }
      );
    }

    await execute(`DELETE FROM ${table("categories")} WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/categories error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
