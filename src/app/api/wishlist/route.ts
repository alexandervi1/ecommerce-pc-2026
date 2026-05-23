import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const wishlist = await query(
      `SELECT w.*, p.name, p.price, p.image, p.slug, p.stock
       FROM wishlist w
       JOIN products p ON w."productId" = p.id
       WHERE w."userId" = $1
       ORDER BY w."createdAt" DESC`,
      [session.user.id]
    );

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Error al obtener wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    }

    const existing = await query(
      'SELECT id FROM wishlist WHERE "userId" = $1 AND "productId" = $2',
      [session.user.id, productId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Producto ya está en wishlist" }, { status: 400 });
    }

    const id = `wish-${Date.now()}`;
    await execute(
      'INSERT INTO wishlist (id, "userId", "productId", "createdAt") VALUES ($1, $2, $3, NOW())',
      [id, session.user.id, productId]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Error al agregar a wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    }

    await execute(
      'DELETE FROM wishlist WHERE "userId" = $1 AND "productId" = $2',
      [session.user.id, productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Error al eliminar de wishlist" }, { status: 500 });
  }
}