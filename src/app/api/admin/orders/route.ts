import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute, table } from "@/lib/db";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

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
    const status = searchParams.get("status");

    if (id) {
      const order = await query(
        `SELECT o.*, u.name as "userName", u.email as "userEmail"
         FROM ${table("orders")} o
         LEFT JOIN ${table("users")} u ON o."userId" = u.id
         WHERE o.id = $1`,
        [id]
      );
    if (order.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const items = await query(
      `SELECT oi.*, p.name as "productName", p.image as "productImage"
       FROM ${table("order_items")} oi
       LEFT JOIN ${table("products")} p ON oi."productId" = p.id
       WHERE oi."orderId" = $1`,
      [id]
    );

    const orderData = order[0] as Record<string, unknown>;
    const itemsData = items as Record<string, unknown>[];
    
    return NextResponse.json({ ...orderData, items: itemsData });
    }

    let sql = `SELECT o.*, u.name as "userName", u.email as "userEmail"
               FROM ${table("orders")} o
               LEFT JOIN ${table("users")} u ON o."userId" = u.id
               WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY o."createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const orders = await query(sql, params);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
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
      return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 });
    }

    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);

    await execute(
      `UPDATE ${table("orders")} SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
      [data.status, id]
    );

    const order = await query(`SELECT * FROM ${table("orders")} WHERE id = $1`, [id]);
    if (order.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(order[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
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
      return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 });
    }

    await execute(`DELETE FROM ${table("order_items")} WHERE "orderId" = $1`, [id]);
    await execute(`DELETE FROM ${table("orders")} WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Error al eliminar pedido" }, { status: 500 });
  }
}