"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, User, Package, Truck, Info, Clock } from "lucide-react";
import { adminApi } from "@/lib/api";
import { Card, Button, Badge, EmptyState, Modal, LoadingSpinner } from "@/components/ui";
import { formatPrice, formatDateTime } from "@/lib/utils";

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
  userName: string | null;
  userEmail: string;
  userPhone: string | null;
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
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "PROCESSING", label: "Procesando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await adminApi.orders.list(params) as Order[];
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrderDetails = async (orderId: string) => {
    try {
      const data = await adminApi.orders.get(orderId) as Order;
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setSaving(true);

    try {
      const updatedOrder = await adminApi.orders.updateStatus(selectedOrder.id, newStatus) as Order;
      setSelectedOrder(updatedOrder);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => 
    STATUS_OPTIONS.find(s => s.value === status)?.label || status;

  const getStatusVariant = (status: string): "success" | "info" | "warning" | "error" | "default" => {
    switch (status) {
      case "DELIVERED": return "success";
      case "SHIPPED": return "info";
      case "PENDING": return "warning";
      case "CANCELLED": return "error";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-white transition-colors">← Volver a Base</Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Gestión de <span className="text-primary">Pedidos</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{orders.length} PEDIDOS REGISTRADOS</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0F0F23]">TODOS LOS ESTADOS</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0F0F23] uppercase">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner text="CARGANDO PEDIDOS..." />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Sin pedidos"
            description="Aún no hay pedidos registrados en el sistema."
          />
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="glass p-8 rounded-[32px] border-white/5 hover:border-primary/30 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black text-white tracking-tight italic uppercase">{order.orderNumber}</h3>
                      <Badge variant={getStatusVariant(order.status)} className="text-[9px] py-1 px-3">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><User className="h-3 w-3" /> {order.userName || order.userEmail}</span>
                      <span className="text-white/10">|</span>
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 border-white/5 pt-6 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Operación</p>
                      <p className="text-2xl font-black text-white tracking-tight">{formatPrice(Number(order.total))}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openOrderDetails(order.id)}
                      className="border-white/10 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest px-6"
                    >
                      DETALLES
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`PEDIDO: ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-10 py-4">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 glass rounded-2xl border-primary/20 bg-primary/5">
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Estado del Pedido</p>
                <p className="text-lg font-black text-white uppercase italic">
                  {getStatusLabel(selectedOrder.status)}
                </p>
              </div>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                className="w-full md:w-auto px-6 py-3 bg-bg border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Perfil del Cliente</h4>
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <p className="text-sm font-black text-white uppercase">{selectedOrder.userName || "Sin nombre"}</p>
                  <p className="text-xs text-gray-400 font-medium">{selectedOrder.userEmail}</p>
                  {selectedOrder.userPhone && <p className="text-xs text-gray-400 font-medium">{selectedOrder.userPhone}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Dirección de Entrega</h4>
                <div className="glass p-5 rounded-2xl border-white/5 space-y-1">
                  <p className="text-sm font-black text-white uppercase">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    {selectedOrder.shippingAddress.phone && <><br />Tel: {selectedOrder.shippingAddress.phone}</>}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Productos del Pedido</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-6 p-4 glass rounded-2xl border-white/5 group hover:bg-white/[0.02] transition-all">
                    <div className="w-16 h-16 glass rounded-xl flex items-center justify-center p-1 border-white/5">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ShoppingCart className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white text-sm uppercase italic tracking-tight">{item.productName}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.quantity} UNIDADES x {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-black text-white text-base tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total del Pedido</p>
                <p className="text-3xl font-black text-primary tracking-tighter italic">{formatPrice(Number(selectedOrder.total))}</p>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">KelectronicaEC</p>
            </div>

            {selectedOrder.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                <p className="text-gray-600">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}