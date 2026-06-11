import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.request.use(this.handleRequest);
    this.client.interceptors.response.use(
      (res) => res,
      this.handleError
    );
  }

  private handleRequest = (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ptv_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  };

  private handleError = async (error: any) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ptv_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  };

  // Auth
  async login(credentials: { employee_number?: string; email?: string; password: string }) {
    return this.client.post<ApiResponse<{ user: any; token: string; expires_in: number }>>('/auth/login', credentials);
  }

  async logout() {
    return this.client.post<ApiResponse>('/auth/logout');
  }

  async getMe() {
    return this.client.get<ApiResponse<any>>('/auth/me');
  }

  async updateProfile(data: FormData) {
    return this.client.put<ApiResponse<any>>('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async changePassword(data: { current_password: string; new_password: string; new_password_confirmation: string }) {
    return this.client.put<ApiResponse>('/auth/change-password', data);
  }

  // Dashboard
  async getDashboard() {
    return this.client.get<ApiResponse<any>>('/dashboard');
  }

  // Users
  async getUsers(params?: Record<string, any>) {
    return this.client.get<ApiResponse<any[]> & { meta: any }>('/users', { params });
  }

  async getUser(id: string) {
    return this.client.get<ApiResponse<any>>(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.client.post<ApiResponse<any>>('/users', data);
  }

  async updateUser(id: string, data: any) {
    return this.client.put<ApiResponse<any>>(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.client.delete<ApiResponse>(`/users/${id}`);
  }

  // Documents
  async getDocuments(params?: Record<string, any>) {
    return this.client.get<ApiResponse<any[]> & { meta: any }>('/documents', { params });
  }

  async getDocument(id: string) {
    return this.client.get<ApiResponse<any>>(`/documents/${id}`);
  }

  async createDocument(data: FormData) {
    return this.client.post<ApiResponse<any>>('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async sendDocument(id: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/send`);
  }

  async receiveDocument(id: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/receive`);
  }

  async approveDocument(id: string, notes?: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/approve`, { notes });
  }

  async rejectDocument(id: string, reason: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/reject`, { reason });
  }

  async returnDocument(id: string, notes: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/return`, { notes });
  }

  async archiveDocument(id: string) {
    return this.client.post<ApiResponse<any>>(`/documents/${id}/archive`);
  }

  async uploadAttachment(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post<ApiResponse<any>>(`/documents/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getDocumentTrail(id: string) {
    return this.client.get<ApiResponse<any[]>>(`/documents/${id}/trail`);
  }

  // Chat
  async getChatRooms() {
    return this.client.get<ApiResponse<any[]>>('/chat/rooms');
  }

  async getMessages(roomId: string, params?: { per_page?: number }) {
    return this.client.get<ApiResponse<any[]> & { meta: any }>(`/chat/rooms/${roomId}/messages`, { params });
  }

  async sendMessage(roomId: string, data: FormData) {
    return this.client.post<ApiResponse<any>>(`/chat/rooms/${roomId}/send`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async markRoomRead(roomId: string) {
    return this.client.post<ApiResponse>(`/chat/rooms/${roomId}/read`);
  }

  async getUnreadChatCount() {
    return this.client.get<ApiResponse<{ count: number }>>('/chat/unread-count');
  }

  // Notifications
  async getNotifications(params?: { per_page?: number }) {
    return this.client.get<ApiResponse<any[]>>('/notifications', { params });
  }

  async markNotificationRead(id: string) {
    return this.client.post<ApiResponse>(`/notifications/${id}/read`);
  }

  async markAllNotificationsRead() {
    return this.client.post<ApiResponse>('/notifications/read-all');
  }

  async getUnreadNotificationCount() {
    return this.client.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  }

  // Search
  async search(q: string, type?: string) {
    return this.client.get<ApiResponse<any>>('/search', { params: { q, type } });
  }

  async advancedSearch(params: Record<string, any>) {
    return this.client.post<ApiResponse<any>>('/search/advanced', params);
  }

  // Activity Logs
  async getLogs(params?: Record<string, any>) {
    return this.client.get<ApiResponse<any[]> & { meta: any }>('/logs', { params });
  }

  async getLogStats() {
    return this.client.get<ApiResponse<any>>('/logs/stats');
  }
}

export const api = new ApiClient();
