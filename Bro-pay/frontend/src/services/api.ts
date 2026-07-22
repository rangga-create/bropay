const API_BASE = 'http://localhost:3000/api';

import { auth } from '../firebase'

interface FetchOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers = {}, ...rest } = options;
  let token = localStorage.getItem('token');

  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch {
      token = localStorage.getItem('token');
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string } | { idToken: string }) =>
      request<{ success: boolean; message: string; user: any; token: string }>('/auth/login', { method: 'POST', body }),
    register: (body: { name: string; email: string; password: string }) =>
      request<{ success: boolean; message: string; user: any }>('/auth/register', { method: 'POST', body }),
    me: () => request<{ user: any }>('/auth/me'),
    updateProfile: (body: any) => request<{ success: boolean; user: any }>('/auth/profile', { method: 'PUT', body }),
  },
  dashboard: {
    get: () => request<{ balance: number; income: number; expense: number; transactions: any[] }>('/dashboard'),
  },
  transactions: {
    list: (params?: { search?: string; type?: string; sort?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<{ transactions: any[]; total: number; page: number; totalPages: number }>(`/transactions${query ? '?' + query : ''}`);
    },
    get: (id: number) => request<{ transaction: any }>(`/transactions/${id}`),
    create: (body: { name: string; type: string; amount: number; note?: string; category?: string }) =>
      request<{ success: boolean; transaction: any; balance: number }>('/transactions', { method: 'POST', body }),
  },
  wallets: {
    list: () => request<{ wallets: any[] }>('/wallets'),
    create: (body: any) => request<{ success: boolean; wallet: any }>('/wallets', { method: 'POST', body }),
  },
  notifications: {
    list: () => request<{ notifications: any[] }>('/notifications'),
    unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
    delete: (id: string) => request<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE' }),
  },
  activity: {
    list: () => request<{ activities: any[] }>('/activity'),
  },
  analytics: {
    summary: (range?: string) => request<any>(`/analytics/summary${range ? '?range=' + range : ''}`),
    categories: (range?: string) => request<any>(`/analytics/categories${range ? '?range=' + range : ''}`),
    monthly: (range?: string) => request<any>(`/analytics/monthly${range ? '?range=' + range : ''}`),
  },
  budgets: {
    list: () => request<{ budgets: any[] }>('/budgets'),
    create: (body: any) => request<{ success: boolean; budget: any }>('/budgets', { method: 'POST', body }),
    update: (id: number, body: any) => request<{ success: boolean; budget: any }>(`/budgets/${id}`, { method: 'PUT', body }),
    delete: (id: number) => request<{ success: boolean }>(`/budgets/${id}`, { method: 'DELETE' }),
  },
  goals: {
    list: () => request<{ goals: any[] }>('/goals'),
    create: (body: any) => request<{ success: boolean; goal: any }>('/goals', { method: 'POST', body }),
    update: (id: number, body: any) => request<{ success: boolean; goal: any }>(`/goals/${id}`, { method: 'PUT', body }),
    delete: (id: number) => request<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }),
  },
  splitBills: {
    list: () => request<{ splitBills: any[] }>('/split-bills'),
    create: (body: any) => request<{ success: boolean; splitBill: any }>('/split-bills', { method: 'POST', body }),
    settle: (id: number) => request<{ success: boolean }>(`/split-bills/${id}/settle`, { method: 'PUT' }),
  },
  moneyRequests: {
    list: () => request<{ requests: any[] }>('/money-requests'),
    create: (body: any) => request<{ success: boolean; request: any }>('/money-requests', { method: 'POST', body }),
    accept: (id: number) => request<{ success: boolean }>(`/money-requests/${id}/accept`, { method: 'PUT' }),
    decline: (id: number) => request<{ success: boolean }>(`/money-requests/${id}/decline`, { method: 'PUT' }),
  },
  settings: {
    get: () => request<any>('/settings'),
    update: (body: any) => request<{ success: boolean; settings: any }>('/settings', { method: 'PUT', body }),
  },
};
