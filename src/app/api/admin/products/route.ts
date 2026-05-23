import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute, table } from "@/lib/db";
import { z } from "zod";

const createComponentSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  brand: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  stock: z.number().int().min(0, "El stock debe ser mayor o igual a 0"),
  image: z.string().optional(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  specifications: z.record(z.string(), z.unknown()).optional(),
  socketType: z.string().optional(),
  wattage: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const updateComponentSchema = createComponentSchema.partial();

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    if (id) {
      const component = await query(
        `SELECT c.*, cc.name as "categoryName", cc.type as "categoryType"
         FROM ${table("components")} c
         LEFT JOIN ${table("component_categories")} cc ON c."categoryId" = cc.id
         WHERE c.id = $1`,
        [id]
      );
      if (component.length === 0) {
        return NextResponse.json({ error: "Componente no encontrado" }, { status: 404 });
      }
      return NextResponse.json(component[0]);
    }

    let sql = `SELECT c.*, cc.name as "categoryName", cc.type as "categoryType"
               FROM ${table("components")} c
               LEFT JOIN ${table("component_categories")} cc ON c."categoryId" = cc.id
               WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (categoryId) {
      sql += ` AND c."categoryId" = $${paramIndex++}`;
      params.push(categoryId);
    }

    if (search) {
      sql += ` AND (c.name ILIKE $${paramIndex} OR c.brand ILIKE $${paramIndex} OR c.model ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY c."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const components = await query(sql, params);
    return NextResponse.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    return NextResponse.json({ error: "Error al obtener componentes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = createComponentSchema.parse(body);

    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    const id = `comp-${slug}-${Date.now()}`;

    await execute(
      `INSERT INTO ${table("components")} (id, name, brand, model, slug, description, price, stock, image, "categoryId", specifications, "socketType", wattage, "isActive", "isFeatured", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
      [
        id,
        data.name,
        data.brand,
        data.model,
        slug,
        data.description || null,
        data.price,
        data.stock,
        data.image || null,
        data.categoryId,
        data.specifications || {},
        data.socketType || null,
        data.wattage || null,
        data.isActive,
        data.isFeatured,
      ]
    );

    const component = await query(
      `SELECT c.*, cc.name as "categoryName" FROM ${table("components")} c LEFT JOIN ${table("component_categories")} cc ON c."categoryId" = cc.id WHERE c.id = $1`,
      [id]
    );
    return NextResponse.json(component[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating component:", error);
    return NextResponse.json({ error: "Error al crear componente" }, { status: 500 });
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
      return NextResponse.json({ error: "ID de componente requerido" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateComponentSchema.parse(body);

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.brand !== undefined) {
      updates.push(`brand = $${paramIndex++}`);
      params.push(data.brand);
    }
    if (data.model !== undefined) {
      updates.push(`model = $${paramIndex++}`);
      params.push(data.model);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }
    if (data.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      params.push(data.price);
    }
    if (data.stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`);
      params.push(data.stock);
    }
    if (data.image !== undefined) {
      updates.push(`image = $${paramIndex++}`);
      params.push(data.image);
    }
    if (data.categoryId !== undefined) {
      updates.push(`"categoryId" = $${paramIndex++}`);
      params.push(data.categoryId);
    }
    if (data.specifications !== undefined) {
      updates.push(`specifications = $${paramIndex++}`);
      params.push(data.specifications);
    }
    if (data.socketType !== undefined) {
      updates.push(`"socketType" = $${paramIndex++}`);
      params.push(data.socketType);
    }
    if (data.wattage !== undefined) {
      updates.push(`wattage = $${paramIndex++}`);
      params.push(data.wattage);
    }
    if (data.isActive !== undefined) {
      updates.push(`"isActive" = $${paramIndex++}`);
      params.push(data.isActive);
    }
    if (data.isFeatured !== undefined) {
      updates.push(`"isFeatured" = $${paramIndex++}`);
      params.push(data.isFeatured);
    }

    updates.push(`"updatedAt" = NOW()`);
    params.push(id);

    await execute(
      `UPDATE ${table("components")} SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    const component = await query(
      `SELECT c.*, cc.name as "categoryName" FROM ${table("components")} c LEFT JOIN ${table("component_categories")} cc ON c."categoryId" = cc.id WHERE c.id = $1`,
      [id]
    );
    if (component.length === 0) {
      return NextResponse.json({ error: "Componente no encontrado" }, { status: 404 });
    }
    return NextResponse.json(component[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating component:", error);
    return NextResponse.json({ error: "Error al actualizar componente" }, { status: 500 });
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
      return NextResponse.json({ error: "ID de componente requerido" }, { status: 400 });
    }

    await execute(`DELETE FROM ${table("components")} WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting component:", error);
    return NextResponse.json({ error: "Error al eliminar componente" }, { status: 500 });
  }
}