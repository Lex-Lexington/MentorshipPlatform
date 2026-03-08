import { v4 as uuidv4 } from 'uuid';
import { Session, ISession, SessionStatus } from '../models';

export interface CreateSessionDTO {
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
}

/**
 * SessionService — handles all data operations for Sessions.
 * Currently uses an in-memory array as a mock database.
 */
export class SessionService {
  private sessions: Session[] = [];

  /**
   * Creates a new mentorship session with 'pending' status.
   */
  public create(dto: CreateSessionDTO): ISession {
    if (!dto.mentorId || !dto.menteeId || !dto.scheduledAt) {
      throw new Error('mentorId, menteeId, and scheduledAt are required.');
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error('scheduledAt must be a valid ISO 8601 date string.');
    }

    const session = new Session(
      uuidv4(),
      dto.mentorId,
      dto.menteeId,
      'pending',
      scheduledDate.toISOString()
    );

    this.sessions.push(session);
    return session;
  }

  /**
   * Updates the status of a session.
   */
  public updateStatus(id: string, status: SessionStatus): ISession {
    const session = this.sessions.find((s) => s.id === id);

    if (!session) {
      throw new Error(`Session with id "${id}" not found.`);
    }

    const validStatuses: SessionStatus[] = ['pending', 'confirmed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }

    session.status = status;
    return session;
  }

  /**
   * Returns all sessions.
   */
  public getAll(): ISession[] {
    return [...this.sessions];
  }
}
