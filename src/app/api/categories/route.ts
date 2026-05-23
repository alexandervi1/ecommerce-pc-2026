import { NextResponse } from "next/server";
import { query, table } from "@/lib/db";

export async function GET() {
  try {
    const categories = await query(
      `SELECT id, name, type, icon, "isRequired" FROM ${table("component_categories")} ORDER BY name`
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}