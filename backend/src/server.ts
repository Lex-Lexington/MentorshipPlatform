import express, { Application } from 'express';
import cors from 'cors';
import { userRoutes, sessionRoutes } from './routes';
import { errorHandler } from './middleware';

/**
 * App class — encapsulates the Express application setup.
 * Follows OOP principles for clean, testable architecture.
 */
class App {
  public app: Application;
  private readonly port: number;

  constructor(port: number = 5000) {
    this.app = express();
    this.port = port;

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Registers global middleware.
   */
  private initializeMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * Registers all route handlers.
   */
  private initializeRoutes(): void {
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/sessions', sessionRoutes);

    // Health check
    this.app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  /**
   * Registers the global error handler (must be last).
   */
  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Starts the Express server.
   */
  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on http://localhost:${this.port}`);
      console.log(`📡 API Base: http://localhost:${this.port}/api`);
    });
  }
}

// Bootstrap
const PORT = parseInt(process.env.PORT || '5000', 10);
const server = new App(PORT);
server.listen();

export default server.app;
