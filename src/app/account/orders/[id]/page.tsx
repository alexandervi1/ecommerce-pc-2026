import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Card, Badge } from "@/components/ui";
import { ArrowLeft, Package, MapPin, Clock } from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
  };
  notes: string | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "info" | "warning" | "error" | "default" }> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  PAID: { label: "Pagado", variant: "info" },
  PROCESSING: { label: "Procesando", variant: "info" },
  SHIPPED: { label: "Enviado", variant: "info" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "error" },
};

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const orders = await query<Order>(
    'SELECT * FROM orders WHERE id = $1 AND "userId" = $2',
    [id, session.user.id]
  );

  if (orders.length === 0) {
    redirect("/account/orders");
  }

  const order = orders[0];
  const items = await query<OrderItem>(
    'SELECT * FROM order_items WHERE "orderId" = $1',
    [id]
  );

  const statusConfig = STATUS_CONFIG[order.status] || { label: order.status, variant: "default" as const };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account/orders" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition w-fit">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mis Pedidos
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pedido {order.orderNumber}</h1>
              <p className="text-gray-600">{formatDateTime(order.createdAt)}</p>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Order Timeline */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Estado del Pedido</h2>
            </div>
            <div className="flex items-center justify-between">
              {["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((status, index) => {
                const orderStatusIndex = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].indexOf(order.status);
                const isCompleted = index <= orderStatusIndex;
                const isCurrent = index === orderStatusIndex;
                
                return (
                  <div key={status} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    } ${isCurrent ? "ring-4 ring-blue-200" : ""}`}>
                      {index + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                      {STATUS_CONFIG[status]?.label || status}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Dirección de Envío</h2>
            </div>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              {order.shippingAddress.phone && <p className="mt-2">Tel: {order.shippingAddress.phone}</p>}
            </div>
          </Card>

          {/* Order Items */}
          <Card padding="none">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.productImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notas</h2>
              <p className="text-gray-600">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}