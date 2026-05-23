import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder, createOrderItem, getOrdersByUserId, createAuditLog } from "@/lib/repositories";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const orders = await getOrdersByUserId(session.user.id);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { shippingAddress, notes, items } = body;

    if (!shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const tax = Math.round(subtotal * 0.09);
    const shipping = subtotal > 500000 ? 0 : 50000;
    const total = subtotal + tax + shipping;

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const orderId = await createOrder({
      orderNumber,
      userId: session.user.id,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      notes,
    });

    for (const item of items) {
      await createOrderItem({
        orderId,
        productId: item.productId,
        buildName: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    }

    await createAuditLog({
      action: "CREATE",
      entity: "Order",
      entityId: orderId,
      newValue: { id: orderId, orderNumber, total },
      userId: session.user.id,
      userEmail: session.user.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ id: orderId, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    await createAuditLog({
      action: "CREATE_ORDER",
      entity: "Order",
      error: error instanceof Error ? error.message : "Unknown error",
      status: "ERROR",
    });
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
  }
}
