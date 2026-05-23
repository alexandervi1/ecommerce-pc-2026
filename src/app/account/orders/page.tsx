import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { EmptyState, Card, StatusBadge } from "@/components/ui";
import { ArrowLeft, Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
}

type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orders = await query<Order>(
    'SELECT * FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC',
    [session.user.id]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition w-fit">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi Cuenta
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600">{orders.length} pedido(s)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No tienes pedidos aún"
            description="Explora nuestros productos y realiza tu primera compra"
            actionLabel="Ver Productos"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} padding="none">
                <div className="p-6 border-b flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <StatusBadge status={order.status.toLowerCase() as OrderStatus} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}