import { Router } from 'express';
import { SessionController } from '../controllers';
import { SessionService } from '../services';

/**
 * Session Routes
 * Mounts all session-related endpoints.
 */
const router = Router();
const sessionService = new SessionService();
const sessionController = new SessionController(sessionService);

// POST /api/sessions
router.post('/', sessionController.create);

// PATCH /api/sessions/:id/status
router.patch('/:id/status', sessionController.updateStatus);

export default router;
