import { NextResponse } from "next/server";
import { query, execute, table } from "@/lib/db";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await query<Setting>(
        `SELECT * FROM ${table("settings")} WHERE key = $1`,
        [key]
      );
      if (setting.length === 0) {
        return NextResponse.json({ error: "Configuración no encontrada" }, { status: 404 });
      }
      return NextResponse.json({ key: setting[0].key, value: setting[0].value });
    }

    const settings = await query<Setting>(
      `SELECT * FROM ${table("settings")} ORDER BY key`
    );
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    for (const [key, value] of Object.entries(settings)) {
      await execute(
        `INSERT INTO ${table("settings")} (key, value, "updatedAt") 
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()`,
        [key, value]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 });
  }
}