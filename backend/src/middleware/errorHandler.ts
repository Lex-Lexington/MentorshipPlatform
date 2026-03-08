import { Request, Response, NextFunction } from 'express';

/**
 * Global error-handling middleware.
 * Catches any unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}
