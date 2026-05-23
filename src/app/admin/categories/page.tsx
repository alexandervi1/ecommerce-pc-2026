"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Tag, Edit, Trash2, Plus, Search, Package, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { adminApi } from "@/lib/api";
import { Modal, LoadingSpinner, EmptyState } from "@/components/ui";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

const emptyForm: FormData = { name: "", slug: "", description: "", image: "", isActive: true };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await adminApi.categories.list(params) as Category[];
      setCategories(data);
    } catch {
      console.error("Error fetching categories");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        image: formData.image || null,
        isActive: formData.isActive,
      };
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, payload);
      } else {
        await adminApi.categories.create(payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setSaving(true);
    try {
      await adminApi.categories.delete(categoryToDelete.id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message || "No se puede eliminar esta categoría");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-56 bg-bg hero-gradient">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="glass p-10 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <Tag className="h-8 w-8 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black text-violet-400 uppercase tracking-[0.3em] hover:text-white transition-colors">
                  ← Volver a Base
                </Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Sectores <span className="text-violet-400">de Catálogo</span>
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                {categories.length} CATEGORÍAS EN EL SISTEMA
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR CATEGORÍA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-3 px-6 py-4 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500/60 rounded-2xl text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner text="CARGANDO SECTORES..." />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Sin Categorías"
            description="No hay categorías registradas. Crea la primera para organizar el catálogo."
          />
        ) : (
          <div className="glass rounded-[40px] overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Nombre</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Slug</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Productos</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/5 group-hover:border-violet-500/30 transition-all">
                            <Tag className="h-4 w-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="font-black text-white text-sm uppercase tracking-tight">{cat.name}</p>
                            {cat.description && (
                              <p className="text-[10px] text-gray-500 font-medium truncate max-w-[200px]">{cat.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-[10px] text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{cat.slug}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-gray-600" />
                          <span className="text-white font-black text-sm">{cat.productCount}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">productos</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                          cat.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }`}>
                          {cat.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                          {cat.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-2 glass rounded-xl border-white/5 hover:border-violet-500/50 hover:text-violet-400 transition-all text-gray-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setCategoryToDelete(cat); setIsDeleteModalOpen(true); }}
                            className="p-2 glass rounded-xl border-white/5 hover:border-red-500/50 hover:text-red-500 transition-all text-gray-500"
                            disabled={cat.productCount > 0}
                            title={cat.productCount > 0 ? "Tiene productos asignados" : "Eliminar"}
                          >
                            <Trash2 className={`h-4 w-4 ${cat.productCount > 0 ? "opacity-30 cursor-not-allowed" : ""}`} />
                          </button>
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "EDITAR CATEGORÍA" : "NUEVA CATEGORÍA"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Nombre</label>
            <input
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-violet-500/50 transition-all"
              placeholder="Ej: Periféricos"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Slug</label>
            <input
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-violet-500/50 transition-all"
              placeholder="Ej: perifericos"
            />
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Solo minúsculas, números y guiones</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Descripción (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none"
              placeholder="Descripción breve de la categoría"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">URL de imagen (opcional)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-xs font-black text-white uppercase tracking-widest">Categoría activa</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isActive ? "bg-violet-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${formData.isActive ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 rounded-xl text-violet-400 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}
        <p className="text-gray-400 text-sm mb-6">
          ¿Eliminar la categoría <strong className="text-white">{categoryToDelete?.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-6 py-3 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
