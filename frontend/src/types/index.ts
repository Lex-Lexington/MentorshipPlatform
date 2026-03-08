/**
 * Shared TypeScript types for the frontend.
 */

export type UserRole = 'mentor' | 'mentee';
export type SessionStatus = 'pending' | 'confirmed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  bio: string;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  status: SessionStatus;
  scheduledAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}
