"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { adminApi } from "@/lib/api";
import { Card, Button, Input, Badge, EmptyState, Modal, LoadingSpinner } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

interface Component {
  id: string;
  name: string;
  brand: string;
  model: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  categoryId: string;
  categoryName: string | null;
  categoryType: string | null;
  specifications: Record<string, unknown>;
  socketType: string | null;
  wattage: number | null;
  isActive: boolean;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface FormData {
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId: string;
  socketType: string;
  wattage: number | null;
  isActive: boolean;
  isFeatured: boolean;
}

const initialFormData: FormData = {
  name: "",
  brand: "",
  model: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  categoryId: "",
  socketType: "",
  wattage: null,
  isActive: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<Component | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const params = debouncedSearch ? { search: debouncedSearch } : {};
      const data = await adminApi.products.list(params) as Component[];
      setComponents(data);
    } catch (error) {
      console.error("Error fetching components:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCategories();
    fetchComponents();
  }, [fetchCategories, fetchComponents]);

  const openCreateModal = () => {
    setEditingComponent(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      brand: component.brand,
      model: component.model,
      description: component.description || "",
      price: component.price,
      stock: component.stock,
      image: component.image || "",
      categoryId: component.categoryId,
      socketType: component.socketType || "",
      wattage: component.wattage,
      isActive: component.isActive,
      isFeatured: component.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingComponent) {
        await adminApi.products.update(editingComponent.id, formData);
      } else {
        await adminApi.products.create(formData);
      }
      setIsModalOpen(false);
      fetchComponents();
    } catch (error) {
      console.error("Error saving component:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!componentToDelete) return;
    setSaving(true);

    try {
      await adminApi.products.delete(componentToDelete.id);
      setIsDeleteModalOpen(false);
      setComponentToDelete(null);
      fetchComponents();
    } catch (error) {
      console.error("Error deleting component:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <Package className="h-8 w-8 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black text-accent uppercase tracking-[0.3em] hover:text-white transition-colors">← Volver a Base</Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Arsenal <span className="text-accent">Inventario</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{components.length} UNIDADES CLASIFICADAS EN EL NÚCLEO</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR EN EL ARSENAL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent/50 transition-all"
              />
            </div>
            <Button 
              onClick={openCreateModal} 
              variant="accent"
              className="w-full sm:w-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            >
              <Plus className="h-4 w-4 mr-2" />
              NUEVO COMPONENTE
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner text="SINCRONIZANDO ARSENAL..." />
          </div>
        ) : components.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Arsenal Vacío"
            description="No se han detectado componentes en el sistema. Inicie despliegue de inventario."
            actionLabel="Añadir Componente"
            actionHref="#"
          />
        ) : (
          <div className="glass rounded-[40px] overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Especificación</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Categoría</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Valor</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Stock</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {components.map((component) => (
                    <tr key={component.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center p-1 border-white/5 group-hover:border-accent/30 transition-all">
                            {component.image ? (
                              <img src={component.image} alt={component.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package className="h-6 w-6 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm uppercase tracking-tight">{component.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{component.brand} • {component.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="text-[9px] py-0.5 px-3 border-white/10 text-gray-400">
                          {component.categoryName || "Générico"}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-accent text-sm tracking-tight">{formatPrice(component.price)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant={component.stock > 5 ? "success" : component.stock > 0 ? "warning" : "error"}>
                          {component.stock} unidades
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Badge variant={component.isActive ? "success" : "default"}>
                            {component.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          {component.isFeatured && <Badge variant="info">Destacado</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(component)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setComponentToDelete(component);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingComponent ? "Editar Componente" : "Nuevo Componente"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Marca"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Modelo"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Categoría</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              >
                <option value="" className="bg-[oklch(12%_0.02_260)]">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[oklch(12%_0.02_260)]">{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Socket Type"
              value={formData.socketType}
              onChange={(e) => setFormData({ ...formData, socketType: e.target.value })}
              placeholder="AM4, LGA1700, etc."
            />
            <Input
              label="Wattage"
              type="number"
              value={formData.wattage || ""}
              onChange={(e) => setFormData({ ...formData, wattage: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Consumo en watts"
            />
          </div>

          <Input
            label="URL de Imagen"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-white transition-colors">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-muted group-hover:text-white transition-colors">Destacado</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingComponent ? "Guardar Cambios" : "Crear Componente"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <p className="text-gray-300 mb-6 font-medium leading-relaxed">
          ¿Estás seguro de que deseas eliminar el componente <strong className="text-white font-black">{componentToDelete?.name}</strong>?{" "}
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={saving}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}