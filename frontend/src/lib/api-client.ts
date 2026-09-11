import { ApiResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('salone_access_token');
      this.refreshToken = localStorage.getItem('salone_refresh_token');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('salone_access_token', accessToken);
      localStorage.setItem('salone_refresh_token', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salone_access_token');
      localStorage.removeItem('salone_refresh_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { idempotencyKey?: string } = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token refresh on 401
    if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/refresh')) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: this.refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newAccess = refreshData.data.accessToken;
            const newRefresh = refreshData.data.refreshToken;
            this.setTokens(newAccess, newRefresh);
            this.onTokenRefreshed(newAccess);
          } else {
            this.clearTokens();
          }
        } catch {
          this.clearTokens();
        } finally {
          this.isRefreshing = false;
        }
      }

      // Retry request with new token
      return new Promise((resolve, reject) => {
        this.addRefreshSubscriber(async (newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          try {
            const retryRes = await fetch(url, { ...options, headers });
            const data = await retryRes.json();
            resolve(data);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    if (response.status === 204) {
      return { data: null as any };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || `HTTP ${response.status} request failed`;
      const err: any = new Error(errorMsg);
      err.code = data.error?.code || 'UNKNOWN_ERROR';
      err.status = response.status;
      err.details = data.error?.details;
      throw err;
    }

    return data;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit & { idempotencyKey?: string }) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(
    file: File,
    folder: 'documents' | 'services' | 'avatars' | 'general' = 'general',
  ): Promise<{ url: string; key: string; fileName: string; fileSize: number; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await this.post<{
            url: string;
            key: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
          }>('/storage/upload', {
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            base64Data,
            folder,
          });
          resolve(res.data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

export const apiClient = new ApiClient();
