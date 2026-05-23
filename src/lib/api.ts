import { formatPrice, formatDateTime, formatDate } from "./utils";
import { 
  DEFAULT_PAGE_SIZE, 
  LOW_STOCK_THRESHOLD, 
  FREE_SHIPPING_THRESHOLD 
} from "./constants";

export { formatPrice, formatDateTime, formatDate };
export { DEFAULT_PAGE_SIZE, LOW_STOCK_THRESHOLD, FREE_SHIPPING_THRESHOLD };

export const api = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Error" }));
      throw new Error(error.error || `Error: ${res.status}`);
    }
    return res.json();
  },

  async post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Error" }));
      throw new Error(error.error || `Error: ${res.status}`);
    }
    return res.json();
  },

  async put<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Error" }));
      throw new Error(error.error || `Error: ${res.status}`);
    }
    return res.json();
  },

  async delete<T>(url: string): Promise<T> {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Error" }));
      throw new Error(error.error || `Error: ${res.status}`);
    }
    return res.json();
  },
};

export const adminApi = {
  products: {
    list: (params?: { search?: string; categoryId?: string; limit?: number; offset?: number }) => 
      api.get(`/api/admin/products?${new URLSearchParams(params as Record<string, string>)}`),
    get: (id: string) => api.get(`/api/admin/products?id=${id}`),
    create: (data: unknown) => api.post("/api/admin/products", data),
    update: (id: string, data: unknown) => api.put(`/api/admin/products?id=${id}`, data),
    delete: (id: string) => api.delete(`/api/admin/products?id=${id}`),
  },
  orders: {
    list: (params?: { status?: string; limit?: number; offset?: number }) =>
      api.get(`/api/admin/orders?${new URLSearchParams(params as Record<string, string>)}`),
    get: (id: string) => api.get(`/api/admin/orders?id=${id}`),
    updateStatus: (id: string, status: string) => api.put(`/api/admin/orders?id=${id}`, { status }),
    delete: (id: string) => api.delete(`/api/admin/orders?id=${id}`),
  },
  users: {
    list: (params?: { search?: string; role?: string; limit?: number; offset?: number }) =>
      api.get(`/api/admin/users?${new URLSearchParams(params as Record<string, string>)}`),
    get: (id: string) => api.get(`/api/admin/users?id=${id}`),
    update: (id: string, data: unknown) => api.put(`/api/admin/users?id=${id}`, data),
    delete: (id: string) => api.delete(`/api/admin/users?id=${id}`),
  },
  categories: {
    list: (params?: { search?: string }) =>
      api.get(`/api/admin/categories?${new URLSearchParams(params as Record<string, string>)}`),
    get: (id: string) => api.get(`/api/admin/categories?id=${id}`),
    create: (data: unknown) => api.post("/api/admin/categories", data),
    update: (id: string, data: unknown) => api.put(`/api/admin/categories?id=${id}`, data),
    delete: (id: string) => api.delete(`/api/admin/categories?id=${id}`),
  },
  analytics: {
    get: (period?: number) => api.get(`/api/admin/analytics?period=${period || 30}`),
  },
};

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(filtered).toString();
}