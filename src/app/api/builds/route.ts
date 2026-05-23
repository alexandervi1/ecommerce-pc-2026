import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPCBuild, getComponentsByIds, createAuditLog, getPCBuildsByUserId, deletePCBuild, getPCBuildById } from "@/lib/repositories";

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get("buildId");

    if (buildId) {
      const build = await getPCBuildById(buildId);
      if (!build) {
        return NextResponse.json({ error: "Build no encontrado" }, { status: 404 });
      }
      return NextResponse.json(build);
    }

    const builds = await getPCBuildsByUserId(session.user.id);
    return NextResponse.json(builds);
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json({ error: "Error al obtener builds" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, componentIds } = body;

    if (!name || !componentIds || componentIds.length === 0) {
      return NextResponse.json(
        { error: "Nombre y componentes son requeridos" },
        { status: 400 }
      );
    }

    const components = await getComponentsByIds(componentIds);
    const totalPrice = components.reduce((sum, comp) => sum + Number(comp.price), 0);

    const buildId = await createPCBuild({
      name,
      userId: session.user.id,
      totalPrice,
      componentIds,
    });

    await createAuditLog({
      action: "CREATE",
      entity: "PCBuild",
      entityId: buildId,
      newValue: { id: buildId, name, totalPrice },
      userId: session.user.id,
      userEmail: session.user.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ id: buildId, name, totalPrice }, { status: 201 });
  } catch (error) {
    console.error("Error creating build:", error);
    await createAuditLog({
      action: "CREATE_BUILD",
      entity: "PCBuild",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "ERROR",
    });
    return NextResponse.json({ error: "Error al crear build" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildId = searchParams.get("buildId");

    if (!buildId) {
      return NextResponse.json({ error: "ID de build requerido" }, { status: 400 });
    }

    const deleted = await deletePCBuild(buildId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Build no encontrado" }, { status: 404 });
    }

    await createAuditLog({
      action: "DELETE",
      entity: "PCBuild",
      entityId: buildId,
      userId: session.user.id,
      userEmail: session.user.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting build:", error);
    return NextResponse.json({ error: "Error al eliminar build" }, { status: 500 });
  }
}
