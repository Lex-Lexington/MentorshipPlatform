/**
 * Session Model / Interface
 * Represents a mentorship session booking.
 */
export type SessionStatus = 'pending' | 'confirmed';

export interface ISession {
  id: string;
  mentorId: string;
  menteeId: string;
  status: SessionStatus;
  scheduledAt: string; // ISO 8601 date string
}

export class Session implements ISession {
  public id: string;
  public mentorId: string;
  public menteeId: string;
  public status: SessionStatus;
  public scheduledAt: string;

  constructor(
    id: string,
    mentorId: string,
    menteeId: string,
    status: SessionStatus,
    scheduledAt: string
  ) {
    this.id = id;
    this.mentorId = mentorId;
    this.menteeId = menteeId;
    this.status = status;
    this.scheduledAt = scheduledAt;
  }
}
