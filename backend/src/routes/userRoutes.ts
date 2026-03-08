import { Router } from 'express';
import { UserController } from '../controllers';
import { UserService } from '../services';

/**
 * User Routes
 * Mounts all user-related endpoints.
 */
const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// GET /api/users?role=mentor&skills=react
router.get('/', userController.getAll);

export default router;
