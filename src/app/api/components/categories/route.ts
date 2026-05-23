import { NextResponse } from "next/server";
import { getComponentCategories } from "@/lib/repositories";

export async function GET() {
  try {
    const categories = await getComponentCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
