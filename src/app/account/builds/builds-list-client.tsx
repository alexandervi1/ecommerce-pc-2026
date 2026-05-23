"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { EmptyState, Card } from "@/components/ui";
import { ArrowLeft, Box, Trash2, ShoppingCart, Loader2 } from "lucide-react";

interface Build {
  id: string;
  name: string;
  totalPrice: number;
  createdAt: string;
}

export default function BuildsListClient({ initialBuilds }: { initialBuilds: Build[] }) {
  const [builds, setBuilds] = useState<Build[]>(initialBuilds);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (buildId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este build?")) return;

    setDeletingId(buildId);
    try {
      const res = await fetch(`/api/builds?buildId=${buildId}`, { method: "DELETE" });
      if (res.ok) {
        setBuilds((prev) => prev.filter((b) => b.id !== buildId));
      }
    } catch (error) {
      console.error("Error deleting build:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (builds.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/account" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition w-fit">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mi Cuenta
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Mis Builds</h1>
            <p className="text-gray-600">0 builds guardados</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon={Box}
            title="No tienes builds guardados"
            description="Crea tu primera PC personalizada en nuestro builder"
            actionLabel="Crear Build"
            actionHref="/build"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition w-fit">
            <ArrowLeft className="h-4 w-4" />
            Volver a Mi Cuenta
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mis Builds</h1>
          <p className="text-gray-600">{builds.length} build(s) guardado(s)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {builds.map((build) => (
            <Card key={build.id} padding="none">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{build.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Creado {formatDateTime(new Date(build.createdAt))}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(Number(build.totalPrice))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/build?load=${build.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Cargar build"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(build.id)}
                      disabled={deletingId === build.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Eliminar build"
                    >
                      {deletingId === build.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}