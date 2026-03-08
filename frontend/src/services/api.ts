import { ApiResponse, User, Session } from '../types';

const API_BASE = '/api';

/**
 * API service for communicating with the backend.
 */
export const api = {
  /**
   * Fetch users with optional filters.
   */
  async getUsers(filters?: {
    role?: string;
    skills?: string;
  }): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.skills) params.set('skills', filters.skills);

    const query = params.toString();
    const url = `${API_BASE}/users${query ? `?${query}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Book a new session.
   */
  async createSession(data: {
    mentorId: string;
    menteeId: string;
    scheduledAt: string;
  }): Promise<ApiResponse<Session>> {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Update session status.
   */
  async updateSessionStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Session>> {
    const res = await fetch(`${API_BASE}/sessions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
};
