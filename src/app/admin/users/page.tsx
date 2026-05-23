"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Edit, Trash2, UserCircle, Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { adminApi } from "@/lib/api";
import { Card, Button, Input, Badge, EmptyState, Modal, Select, LoadingSpinner } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  orderCount: number;
}

interface FormData {
  name: string;
  role: "USER" | "ADMIN";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    role: "USER",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      const data = await adminApi.users.list(params) as User[];
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      role: user.role as "USER" | "ADMIN",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      await adminApi.users.update(editingUser.id, formData);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setSaving(true);

    try {
      await adminApi.users.delete(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
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
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] hover:text-white transition-colors">← Volver a Base</Link>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Base de <span className="text-emerald-500">Operadores</span></h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{users.length} PERFILES ACTIVOS EN EL SISTEMA</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="BUSCAR OPERADOR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0F0F23]">TODOS LOS ROLES</option>
              <option value="ADMIN" className="bg-[#0F0F23]">ADMINISTRADORES</option>
              <option value="CLIENT" className="bg-[#0F0F23]">CLIENTES</option>
              <option value="AUDITOR" className="bg-[#0F0F23]">AUDITORES</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner text="ESCANEO DE BIOMETRÍA..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sin Operadores"
            description="No se han detectado perfiles en la base de datos."
          />
        ) : (
          <div className="glass rounded-[40px] overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Identidad</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Privilegios</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Actividad</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Registro</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 glass rounded-full flex items-center justify-center border-white/5 group-hover:border-emerald-500/30 transition-all overflow-hidden bg-white/5">
                            <UserCircle className="h-7 w-7 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-black text-white text-sm uppercase tracking-tight">{user.name || "Sin Identificar"}</p>
                            <p className="text-[10px] text-gray-500 font-bold lowercase tracking-wider">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge 
                          variant={user.role === "ADMIN" ? "info" : user.role === "AUDITOR" ? "warning" : "default"}
                          className="text-[9px] py-1 px-3 border-white/10 uppercase"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-black text-sm">{user.orderCount}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Pedidos</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-2 glass rounded-xl border-white/5 hover:border-emerald-500/50 hover:text-emerald-500 transition-all text-gray-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 glass rounded-xl border-white/5 hover:border-red-500/50 hover:text-red-500 transition-all text-gray-500"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="MODIFICAR PERFIL DE OPERADOR"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Input
            label="NOMBRE COMPLETO"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-white/5 border-white/10 text-white uppercase font-bold text-xs tracking-widest"
          />

          <Select
            label="NIVEL DE PRIVILEGIOS"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: "CLIENT", label: "CLIENTE" },
              { value: "ADMIN", label: "ADMINISTRADOR" },
              { value: "AUDITOR", label: "AUDITOR" },
            ]}
          />

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-500 uppercase font-black text-[10px] tracking-widest">
              ABORTAR
            </Button>
            <Button type="submit" variant="accent" isLoading={saving} className="px-8 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              GUARDAR CAMBIOS
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
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.name || userToDelete?.email}</strong>?
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