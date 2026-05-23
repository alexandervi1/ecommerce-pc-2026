import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, table } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    const days = parseInt(period);

    // Using table() helper to ensure we point to the correct schema (auth)
    const overview = await query(`
      SELECT 
        COUNT(*) as "totalOrders",
        COALESCE(SUM(total), 0) as "totalRevenue",
        COALESCE(AVG(total), 0) as "averageOrderValue",
        COUNT(DISTINCT "userId") as "totalCustomers"
      FROM ${table("orders")}
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        AND status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
    `);

    const ordersByStatus = await query(`
      SELECT status, COUNT(*) as count 
      FROM ${table("orders")}
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY status
      ORDER BY count DESC
    `);

    const topProducts = await query(`
      SELECT 
        p.id,
        p.name,
        p.image,
        SUM(oi.quantity) as "totalSold",
        SUM(oi.price * oi.quantity) as "totalRevenue"
      FROM ${table("order_items")} oi
      JOIN ${table("products")} p ON oi."productId" = p.id
      JOIN ${table("orders")} o ON oi."orderId" = o.id
      WHERE o."createdAt" >= NOW() - INTERVAL '${days} days'
        AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      GROUP BY p.id, p.name, p.image
      ORDER BY "totalSold" DESC
      LIMIT 10
    `);

    const dailySales = await query(`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM ${table("orders")}
      WHERE "createdAt" >= NOW() - INTERVAL '${days} days'
        AND status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `);

    const categorySales = await query(`
      SELECT 
        c.name as category,
        COUNT(oi.id) as "itemsSold",
        SUM(oi.price * oi.quantity) as revenue
      FROM ${table("order_items")} oi
      JOIN ${table("products")} p ON oi."productId" = p.id
      JOIN ${table("categories")} c ON p."categoryId" = c.id
      JOIN ${table("orders")} o ON oi."orderId" = o.id
      WHERE o."createdAt" >= NOW() - INTERVAL '${days} days'
        AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
      GROUP BY c.name
      ORDER BY revenue DESC
    `);

    const lowStockProducts = await query(`
      SELECT id, name, stock, "categoryId"
      FROM ${table("products")}
      WHERE stock <= 5 AND "isActive" = true
      ORDER BY stock ASC
      LIMIT 10
    `);

    const previousPeriodRevenue = await query(`
      SELECT COALESCE(SUM(total), 0) as revenue
      FROM ${table("orders")}
      WHERE "createdAt" >= NOW() - INTERVAL '${days * 2} days'
        AND "createdAt" < NOW() - INTERVAL '${days} days'
        AND status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
    `) as { revenue: string }[];

    const currentRevenue = Number((overview as { totalRevenue: string }[])[0]?.totalRevenue || 0);
    const prevRevenue = Number(previousPeriodRevenue[0]?.revenue || 0);
    const revenueChange = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      overview: {
        totalOrders: Number((overview as { totalOrders: string }[])[0]?.totalOrders || 0),
        totalRevenue: currentRevenue,
        averageOrderValue: Number((overview as { averageOrderValue: string }[])[0]?.averageOrderValue || 0),
        totalCustomers: Number((overview as { totalCustomers: string }[])[0]?.totalCustomers || 0),
        revenueChange: Number(revenueChange),
      },
      ordersByStatus,
      topProducts,
      dailySales,
      categorySales,
      lowStockProducts,
      period: days,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Error al obtener analytics" }, { status: 500 });
  }
}
