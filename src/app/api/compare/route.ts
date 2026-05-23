import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const products = await getProductsByIds(ids);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching compare products:", error);
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}