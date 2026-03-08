import { Request, Response } from 'express';
import { UserService } from '../services';
import { UserRole } from '../models';

/**
 * UserController — handles HTTP requests for User-related endpoints.
 * Follows the Controller layer of the MVC pattern.
 */
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * GET /api/users
   * Supports query params: ?role=mentor&skills=react,typescript
   */
  public getAll = (req: Request, res: Response): void => {
    try {
      const role = req.query.role as UserRole | undefined;
      const skills = req.query.skills as string | undefined;

      // Validate role if provided
      if (role && !['mentor', 'mentee'].includes(role)) {
        res.status(400).json({
          success: false,
          error: `Invalid role "${role}". Must be "mentor" or "mentee".`,
        });
        return;
      }

      const users = this.userService.getAll({ role, skills });

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ success: false, error: message });
    }
  };
}
