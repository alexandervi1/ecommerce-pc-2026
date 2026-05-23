import { NextResponse } from "next/server";
import { getComponentsByCategory } from "@/lib/repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId es requerido" }, { status: 400 });
    }

    const components = await getComponentsByCategory(categoryId);
    return NextResponse.json(components);
  } catch (error) {
    console.error("Error fetching components:", error);
    return NextResponse.json(
      { error: "Error al obtener componentes" },
      { status: 500 }
    );
  }
}
