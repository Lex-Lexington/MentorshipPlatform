# 🎯 IT Mentorship Platform

A full-stack IT Mentorship Platform built with **Node.js**, **Express.js**, **TypeScript** (backend) and **React**, **TypeScript**, **Vite** (frontend).

## Project Structure

```
MentorshipPlatform/
├── backend/
│   ├── src/
│   │   ├── controllers/       # MVC Controllers — handle HTTP requests
│   │   │   ├── UserController.ts
│   │   │   ├── SessionController.ts
│   │   │   └── index.ts
│   │   ├── models/            # Data models & TypeScript interfaces
│   │   │   ├── User.ts
│   │   │   ├── Session.ts
│   │   │   └── index.ts
│   │   ├── routes/            # Express route definitions
│   │   │   ├── userRoutes.ts
│   │   │   ├── sessionRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/          # Business logic & data access (mock DB)
│   │   │   ├── UserService.ts
│   │   │   ├── SessionService.ts
│   │   │   └── index.ts
│   │   ├── middleware/        # Express middleware (error handler, etc.)
│   │   │   ├── errorHandler.ts
│   │   │   └── index.ts
│   │   └── server.ts         # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MentorCard/    # Mentor info display card
│   │   │   ├── SkillFilter/   # Dynamic skill filtering sidebar
│   │   │   └── BookingModal/  # Session booking modal with form
│   │   ├── pages/
│   │   │   └── MentorsPage/   # Main Mentors Directory page
│   │   ├── services/
│   │   │   └── api.ts         # API client service
│   │   ├── types/
│   │   │   └── index.ts       # Shared TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

| Method  | Endpoint                      | Description                |
|---------|-------------------------------|----------------------------|
| GET     | `/api/users`                  | List users (with filters)  |
| GET     | `/api/users?role=mentor`      | Filter by role             |
| GET     | `/api/users?skills=react,ts`  | Filter by skills           |
| POST    | `/api/sessions`               | Book a new session         |
| PATCH   | `/api/sessions/:id/status`    | Update session status      |
| GET     | `/api/health`                 | Health check               |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
npm install
npm run dev        # starts dev server on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts Vite dev server on http://localhost:3000
```

The frontend Vite dev server proxies `/api` requests to the backend on port 5000.

## Design Patterns

- **OOP**: Models are implemented as TypeScript classes with encapsulation
- **MVC**: Clear separation — Models, Controllers, Routes (Views are the React frontend)
- **Service Layer**: Business logic is isolated in Service classes
- **Dependency Injection**: Controllers receive services via constructor injection
