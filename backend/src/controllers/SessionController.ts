import { Request, Response } from 'express';
import { SessionService } from '../services';
import { SessionStatus } from '../models';

/**
 * SessionController — handles HTTP requests for Session-related endpoints.
 * Follows the Controller layer of the MVC pattern.
 */
export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  /**
   * POST /api/sessions
   * Body: { mentorId, menteeId, scheduledAt }
   */
  public create = (req: Request, res: Response): void => {
    try {
      const { mentorId, menteeId, scheduledAt } = req.body;

      if (!mentorId || !menteeId || !scheduledAt) {
        res.status(400).json({
          success: false,
          error: 'mentorId, menteeId, and scheduledAt are required.',
        });
        return;
      }

      const session = this.sessionService.create({ mentorId, menteeId, scheduledAt });

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(400).json({ success: false, error: message });
    }
  };

  /**
   * PATCH /api/sessions/:id/status
   * Body: { status }
   */
  public updateStatus = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: SessionStatus };

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'status is required in the request body.',
        });
        return;
      }

      const session = this.sessionService.updateStatus(id, status);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  };
}
