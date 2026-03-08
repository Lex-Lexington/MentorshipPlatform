# 🔍 Code Walkthrough — How to Read & Reverse-Engineer This Codebase

> **Purpose**: This document teaches you how to read, trace, and understand every line
> of this IT Mentorship Platform. If someone handed you this code with zero context,
> follow the steps below to fully reverse-engineer how it works.

---

## Table of Contents

1. [General Strategy: How to Read Any Codebase](#1-general-strategy-how-to-read-any-codebase)
2. [Step 1 — Identify the Tech Stack](#2-step-1--identify-the-tech-stack)
3. [Step 2 — Understand the Folder Structure](#3-step-2--understand-the-folder-structure)
4. [Step 3 — Find the Entry Point (Start Here)](#4-step-3--find-the-entry-point-start-here)
5. [Step 4 — Trace the Backend Request Lifecycle](#5-step-4--trace-the-backend-request-lifecycle)
6. [Step 5 — Read the Data Models](#6-step-5--read-the-data-models)
7. [Step 6 — Read the Service Layer (Business Logic)](#7-step-6--read-the-service-layer-business-logic)
8. [Step 7 — Read the Controllers (HTTP Handlers)](#8-step-7--read-the-controllers-http-handlers)
9. [Step 8 — Read the Routes (URL Wiring)](#9-step-8--read-the-routes-url-wiring)
10. [Step 9 — Trace the Frontend Entry Point](#10-step-9--trace-the-frontend-entry-point)
11. [Step 10 — Read the Frontend Page & Components](#11-step-10--read-the-frontend-page--components)
12. [Step 11 — Trace a Full User Action End-to-End](#12-step-11--trace-a-full-user-action-end-to-end)
13. [Design Patterns Cheat-Sheet](#13-design-patterns-cheat-sheet)
14. [Key TypeScript Concepts Used](#14-key-typescript-concepts-used)
15. [Quick Reference: File → Purpose Map](#15-quick-reference-file--purpose-map)

---

## 1. General Strategy: How to Read Any Codebase

Before diving into specific files, here is a universal 5-step process for reverse-engineering
any unfamiliar project:

```
Step 1 → Look at package.json / config files     (What tools and libraries does it use?)
Step 2 → Study the folder structure               (How is the code organized?)
Step 3 → Find the entry point                     (Where does execution BEGIN?)
Step 4 → Trace a single request/action end-to-end (Follow data from input → output)
Step 5 → Read supporting files outward             (Models, utilities, styles, etc.)
```

> **Golden Rule**: Never try to read every file top-to-bottom. Instead, pick ONE feature
> (e.g., "list mentors") and trace it from the user's click all the way to the database
> and back to the screen. This gives you a "thread" through the code that connects everything.

---

## 2. Step 1 — Identify the Tech Stack

### Where to look first:
Open `backend/package.json` and `frontend/package.json`. The `dependencies` section tells
you exactly what libraries the project uses.

### Backend (`backend/package.json`):
```
"dependencies": {
  "cors": "^2.8.5",        ← Allows frontend (port 3000) to talk to backend (port 5000)
  "express": "^4.18.2",    ← The HTTP web framework (handles routes, requests, responses)
  "uuid": "^9.0.0"         ← Generates unique IDs like "a3f1e2d4-..." for users/sessions
}
"devDependencies": {
  "typescript": "^5.3.3",  ← The project is written in TypeScript, not plain JavaScript
  "ts-node-dev": "^2.0.0"  ← Runs TypeScript directly during development (no build step)
}
```

### Frontend (`frontend/package.json`):
```
"dependencies": {
  "react": "^18.3.1",      ← UI library — the whole frontend is built with React components
  "react-dom": "^18.3.1"   ← Renders React components into the browser DOM
}
"devDependencies": {
  "vite": "^6.0.3",        ← Fast build tool / dev server (replaces older Webpack)
  "typescript": "^5.6.3"   ← TypeScript for type safety
}
```

### What to look for in `tsconfig.json`:
```
"outDir": "./dist"     ← Compiled JavaScript goes here (you run dist/server.js in production)
"rootDir": "./src"     ← All source code lives under src/
"strict": true         ← Maximum type safety enabled
"jsx": "react-jsx"     ← (frontend) tells TypeScript to understand JSX/TSX syntax
```

---

## 3. Step 2 — Understand the Folder Structure

```
MentorshipPlatform/
├── backend/
│   └── src/
│       ├── server.ts          ← 🚀 ENTRY POINT — start reading here
│       ├── models/            ← 📦 Data shapes (User, Session)
│       │   ├── User.ts
│       │   ├── Session.ts
│       │   └── index.ts       ← Re-exports everything for clean imports
│       ├── services/          ← 🧠 Business logic + data access (mock database)
│       │   ├── UserService.ts
│       │   ├── SessionService.ts
│       │   └── index.ts
│       ├── controllers/       ← 🎮 HTTP request handlers (reads req, calls service, sends res)
│       │   ├── UserController.ts
│       │   ├── SessionController.ts
│       │   └── index.ts
│       ├── routes/            ← 🛤️ URL → Controller wiring
│       │   ├── userRoutes.ts
│       │   ├── sessionRoutes.ts
│       │   └── index.ts
│       └── middleware/        ← 🛡️ Cross-cutting concerns (error handling)
│           ├── errorHandler.ts
│           └── index.ts
│
├── frontend/
│   └── src/
│       ├── main.tsx           ← 🚀 ENTRY POINT — React app bootstraps here
│       ├── App.tsx            ← Root component (renders MentorsPage)
│       ├── types/index.ts     ← 📦 Shared TypeScript types (User, Session, ApiResponse)
│       ├── services/api.ts    ← 📡 HTTP client (fetch calls to backend)
│       ├── pages/
│       │   └── MentorsPage/   ← 📄 Main page (fetches mentors, renders grid + sidebar)
│       └── components/
│           ├── MentorCard/    ← 🃏 Single mentor display card
│           ├── SkillFilter/   ← 🏷️ Sidebar with clickable skill chips
│           └── BookingModal/  ← 📅 Modal form for booking sessions
```

### The `index.ts` barrel pattern:
Every folder has an `index.ts` that re-exports its contents. This is why imports look clean:
```typescript
// Instead of:
import { UserController } from '../controllers/UserController';
// You can write:
import { UserController } from '../controllers';  // ← reads from controllers/index.ts
```

---

## 4. Step 3 — Find the Entry Point (Start Here)

### Backend: `backend/src/server.ts`

This is the **first file that executes** when you run `npm run dev`. Read it like a story:

```typescript
// LINE 1-4: Import dependencies
import express, { Application } from 'express';    // The web framework
import cors from 'cors';                            // Cross-origin middleware
import { userRoutes, sessionRoutes } from './routes'; // Our route handlers
import { errorHandler } from './middleware';         // Our error handler

// LINE 10-22: The App class wraps Express in OOP style
class App {
  public app: Application;          // The Express instance
  private readonly port: number;    // Which port to listen on

  constructor(port: number = 5000) {
    this.app = express();           // Create the Express app
    this.port = port;

    // These 3 calls happen IN ORDER — order matters!
    this.initializeMiddleware();    // 1st: Set up parsing, CORS
    this.initializeRoutes();       // 2nd: Set up URL handlers
    this.initializeErrorHandling();// 3rd: Set up error catcher (MUST be last)
  }
```

**How to read the constructor**: When `new App(5000)` runs, these three methods fire in
sequence. They configure Express before it starts listening. Think of it as "assembling a
pipeline" that every HTTP request will flow through:

```
Request → [CORS] → [JSON Parser] → [Routes] → [Error Handler] → Response
```

```typescript
  // LINE 27-31: Middleware — runs on EVERY request before routes
  private initializeMiddleware(): void {
    this.app.use(cors());                               // Allow cross-origin requests
    this.app.use(express.json());                       // Parse JSON request bodies
    this.app.use(express.urlencoded({ extended: true }));// Parse form-encoded bodies
  }

  // LINE 36-43: Routes — maps URLs to handler functions
  private initializeRoutes(): void {
    this.app.use('/api/users', userRoutes);      // Any request to /api/users/* → userRoutes
    this.app.use('/api/sessions', sessionRoutes);// Any request to /api/sessions/* → sessionRoutes

    this.app.get('/api/health', (_req, res) => { // Inline health check endpoint
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }
```

**How `app.use('/api/users', userRoutes)` works**:
Express strips the prefix `/api/users` and forwards the remainder to `userRoutes`.
So when someone hits `GET /api/users`, Express sends it to `userRoutes` as `GET /`.

```typescript
// LINE 63-66: Bootstrap — this is the actual execution
const PORT = parseInt(process.env.PORT || '5000', 10);  // Read port from env or default 5000
const server = new App(PORT);  // Create the App (runs constructor → sets up everything)
server.listen();               // Start listening for HTTP requests
```

---

## 5. Step 4 — Trace the Backend Request Lifecycle

Let's trace what happens when a browser sends `GET /api/users?role=mentor&skills=react`:

```
Browser sends GET /api/users?role=mentor&skills=react
  │
  ▼
[server.ts] Express receives the request
  │  app.use('/api/users', userRoutes)  ← matches /api/users prefix
  │
  ▼
[routes/userRoutes.ts] Router matches GET /
  │  router.get('/', userController.getAll)  ← calls the controller method
  │
  ▼
[controllers/UserController.ts] getAll() method runs
  │  1. Reads query params: role='mentor', skills='react'
  │  2. Validates the role value
  │  3. Calls this.userService.getAll({ role, skills })
  │
  ▼
[services/UserService.ts] getAll() method runs
  │  1. Copies the users array
  │  2. Filters by role === 'mentor' (removes mentees)
  │  3. Filters by skills containing 'react'
  │  4. Maps each User to toSafeObject() (strips password)
  │  5. Returns the filtered array
  │
  ▼
[controllers/UserController.ts] receives the result
  │  Sends res.status(200).json({ success: true, count: N, data: [...] })
  │
  ▼
Browser receives JSON response
```

---

## 6. Step 5 — Read the Data Models

### `models/User.ts` — Read it in 3 parts:

**Part 1 — The Type Alias:**
```typescript
export type UserRole = 'mentor' | 'mentee';
```
This says: a UserRole can ONLY be the string `'mentor'` or `'mentee'`. TypeScript will
throw a compile error if you try to set it to anything else like `'admin'`.

**Part 2 — The Interface (the "shape" of data):**
```typescript
export interface IUser {
  id: string;           // UUID like "a3f1e2d4-5b6c-7d8e-9f0a-1b2c3d4e5f6a"
  name: string;         // "Alice Johnson"
  email: string;        // "alice@example.com"
  password: string;     // Stored hash (never sent to frontend)
  role: UserRole;       // 'mentor' or 'mentee'
  skills: string[];     // ['react', 'typescript', 'node.js']
  bio: string;          // Free text description
}
```
An interface is a **contract**: any object claiming to be an `IUser` MUST have all these
fields with these exact types. It doesn't generate any JavaScript code — it's purely for
type checking at compile time.

**Part 3 — The Class (the "living" object):**
```typescript
export class User implements IUser {
  // "implements IUser" means: this class MUST have every field from IUser
  // If you forget one, TypeScript will give you a compile error

  public toSafeObject(): Omit<IUser, 'password'> {
    // Omit<IUser, 'password'> means: "IUser but WITHOUT the password field"
    // This is used when sending user data to the frontend — never expose passwords
    return { id, name, email, role, skills, bio };  // password intentionally excluded
  }
}
```

**Why both interface AND class?**
- The **interface** (`IUser`) defines the data shape — used for type checking
- The **class** (`User`) adds behavior — the `toSafeObject()` method
- This follows the OOP principle of **encapsulation**: the User object controls how
  its own data is exposed

### `models/Session.ts` — Same pattern, simpler:
```typescript
export type SessionStatus = 'pending' | 'confirmed';

export interface ISession {
  id: string;
  mentorId: string;      // References a User.id
  menteeId: string;      // References a User.id
  status: SessionStatus; // 'pending' when created, 'confirmed' after approval
  scheduledAt: string;   // ISO 8601 date like "2026-03-15T14:00:00.000Z"
}
```

---

## 7. Step 6 — Read the Service Layer (Business Logic)

Services are the **brain** of the backend. They contain all the business rules and data access.
Controllers just translate HTTP → Service calls → HTTP responses.

### `services/UserService.ts` — Line by line:

```typescript
export class UserService {
  private users: User[] = [];    // ← This IS the "database" — a private in-memory array

  constructor() {
    this.seed();   // On creation, fill the array with sample data
  }
```

**Key insight**: `private users` means no code outside this class can directly touch the
data. All access goes through the class methods (`getAll`, `findById`). This is **encapsulation**.

```typescript
  private seed(): void {
    const sampleUsers: Omit<IUser, 'id'>[] = [...]
    // Omit<IUser, 'id'> means "all IUser fields EXCEPT id"
    // Because we generate the id ourselves using uuidv4()

    this.users = sampleUsers.map(
      (u) => new User(uuidv4(), u.name, u.email, u.password, u.role, u.skills, u.bio)
    );
    // uuidv4() generates a random unique ID for each user
    // new User(...) creates a proper User class instance (with toSafeObject() method)
  }
```

```typescript
  public getAll(filters?: { role?: UserRole; skills?: string }): Omit<IUser, 'password'>[] {
    // The ? after 'filters' means the parameter is OPTIONAL
    // You can call getAll() with no arguments, or getAll({ role: 'mentor' })

    let result = [...this.users];  // Spread operator creates a COPY (doesn't mutate original)

    // FILTER 1: by role
    if (filters?.role) {
      result = result.filter((u) => u.role === filters.role);
      // .filter() keeps only items where the callback returns true
    }

    // FILTER 2: by skills (comma-separated string like "react,typescript")
    if (filters?.skills) {
      const skillList = filters.skills
        .split(',')                    // "react,typescript" → ['react', 'typescript']
        .map((s) => s.trim().toLowerCase());

      result = result.filter((u) =>
        skillList.some((skill) =>       // .some() = "does ANY skill match?"
          u.skills.map((s) => s.toLowerCase()).includes(skill)
        )
      );
    }

    return result.map((u) => u.toSafeObject());  // Strip passwords before returning
  }
```

### `services/SessionService.ts` — Key method:

```typescript
  public create(dto: CreateSessionDTO): ISession {
    // DTO = Data Transfer Object — a plain object carrying input data

    // VALIDATION: check required fields
    if (!dto.mentorId || !dto.menteeId || !dto.scheduledAt) {
      throw new Error('mentorId, menteeId, and scheduledAt are required.');
      // throw stops execution and sends the error up to the controller's catch block
    }

    // VALIDATION: check the date is actually a valid date
    const scheduledDate = new Date(dto.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error('scheduledAt must be a valid ISO 8601 date string.');
    }

    const session = new Session(uuidv4(), dto.mentorId, dto.menteeId, 'pending', ...);
    this.sessions.push(session);  // "Save" to our in-memory array
    return session;
  }
```

**Error handling pattern**: Services `throw` errors. Controllers `catch` them and convert
them to proper HTTP status codes (400, 404, 500). This separation keeps the service layer
clean — it doesn't need to know about HTTP at all.

---

## 8. Step 7 — Read the Controllers (HTTP Handlers)

Controllers are the **translators** between HTTP and business logic.

### `controllers/UserController.ts`:

```typescript
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    // ↑ DEPENDENCY INJECTION: the controller doesn't create the service itself.
    // It receives it from outside. This makes testing easier — you can pass a mock.
  }

  // Arrow function syntax (= () =>) preserves 'this' context when Express calls it
  public getAll = (req: Request, res: Response): void => {
    try {
      // STEP 1: Extract data from the HTTP request
      const role = req.query.role as UserRole | undefined;
      const skills = req.query.skills as string | undefined;
      // req.query contains URL query parameters: ?role=mentor → { role: 'mentor' }

      // STEP 2: Validate input
      if (role && !['mentor', 'mentee'].includes(role)) {
        res.status(400).json({ success: false, error: '...' });
        return;  // IMPORTANT: must return to stop execution after sending response
      }

      // STEP 3: Call the service (business logic)
      const users = this.userService.getAll({ role, skills });

      // STEP 4: Send the HTTP response
      res.status(200).json({ success: true, count: users.length, data: users });

    } catch (error) {
      // STEP 5: Handle unexpected errors
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ success: false, error: message });
    }
  };
}
```

### `controllers/SessionController.ts` — The update status method:

```typescript
  public updateStatus = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;         // From the URL: /api/sessions/:id/status
      const { status } = req.body;       // From the JSON body: { "status": "confirmed" }

      const session = this.sessionService.updateStatus(id, status);
      res.status(200).json({ success: true, data: session });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      // Smart status code: if the error says "not found", use 404; otherwise 400
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  };
```

---

## 9. Step 8 — Read the Routes (URL Wiring)

Routes are the **simplest files** — they just connect URLs to controller methods.

### `routes/userRoutes.ts`:
```typescript
const router = Router();                                // Create an Express router
const userService = new UserService();                  // Create the service (has the data)
const userController = new UserController(userService); // Inject service into controller

router.get('/', userController.getAll);
// When Express receives GET /api/users, it calls userController.getAll
// Remember: server.ts stripped the /api/users prefix, so the route here is just /

export default router;
```

### `routes/sessionRoutes.ts`:
```typescript
router.post('/', sessionController.create);
// POST /api/sessions → sessionController.create

router.patch('/:id/status', sessionController.updateStatus);
// PATCH /api/sessions/abc123/status → sessionController.updateStatus
// :id is a URL parameter — Express puts it in req.params.id
```

**How to read `:id`**: The colon means "this part is a variable". So the route
`/:id/status` matches `/abc123/status`, `/xyz789/status`, etc. The actual value
is available as `req.params.id`.

---

## 10. Step 9 — Trace the Frontend Entry Point

### `frontend/src/main.tsx`:
```typescript
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />              {/* ← The entire app starts here */}
  </React.StrictMode>
);
```

**What this does**:
1. Finds the `<div id="root">` in `index.html`
2. Mounts the React app inside it
3. `<App />` renders → which renders `<MentorsPage />` → which renders everything else

### `frontend/src/App.tsx`:
```typescript
const App: React.FC = () => {
  return <MentorsPage />;    // The entire app is just this one page (for now)
};
```

### `frontend/src/types/index.ts` — Shared types:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;      // Note: NO password field — backend strips it via toSafeObject()
  role: UserRole;
  skills: string[];
  bio: string;
}

export interface ApiResponse<T> {    // Generic type — T is a placeholder
  success: boolean;
  data: T;             // For getUsers, T = User[]. For createSession, T = Session.
  count?: number;
  error?: string;
}
```

### `frontend/src/services/api.ts` — HTTP client:
```typescript
export const api = {
  async getUsers(filters?: { role?: string; skills?: string }): Promise<ApiResponse<User[]>> {
    // Build query string: { role: 'mentor', skills: 'react' } → "role=mentor&skills=react"
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.skills) params.set('skills', filters.skills);

    const query = params.toString();
    const url = `${API_BASE}/users${query ? `?${query}` : ''}`;

    const res = await fetch(url);        // Browser's native HTTP client
    if (!res.ok) { /* handle error */ }
    return res.json();                   // Parse JSON response
  },
};
```

**Why `/api/users` works without `http://localhost:5000`**:
The Vite config (`vite.config.ts`) has a **proxy** setting:
```typescript
proxy: { '/api': { target: 'http://localhost:5000' } }
```
So `/api/users` on port 3000 is automatically forwarded to `http://localhost:5000/api/users`.

---

## 11. Step 10 — Read the Frontend Page & Components

### `pages/MentorsPage/MentorsPage.tsx` — The orchestrator:

**State variables** (think of these as "live data" that React watches for changes):
```typescript
const [mentors, setMentors] = useState<User[]>([]);           // The mentor list to display
const [allSkills, setAllSkills] = useState<string[]>([]);      // All unique skills for filter
const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // Currently active filters
const [loading, setLoading] = useState(true);                  // Show spinner?
const [error, setError] = useState<string | null>(null);       // Error message (or null)
const [selectedMentor, setSelectedMentor] = useState<User | null>(null); // Modal target
```

**Data fetching with hooks**:
```typescript
// useCallback creates a STABLE function reference that only changes when selectedSkills changes
const fetchMentors = useCallback(async () => {
  setLoading(true);
  const response = await api.getUsers({ role: 'mentor', skills: selectedSkills.join(',') });
  setMentors(response.data);
  setLoading(false);
}, [selectedSkills]);    // ← dependency array: recreate this function when selectedSkills changes

// useEffect runs this function when the component mounts AND when fetchMentors changes
useEffect(() => {
  fetchMentors();
}, [fetchMentors]);
```

**How the chain works**:
```
User clicks a skill chip
  → setSelectedSkills([...prev, 'react'])     // State updates
  → selectedSkills changes
  → fetchMentors is recreated (new reference)  // useCallback dependency
  → useEffect detects fetchMentors changed
  → fetchMentors() runs → API call → setMentors(newData)
  → React re-renders with new mentor list
```

**Conditional rendering** (the JSX):
```tsx
{loading && <Spinner />}                           // Show ONLY while loading
{error && <ErrorMessage />}                        // Show ONLY if error exists
{!loading && !error && mentors.length === 0 && <EmptyState />}  // No results
{!loading && !error && mentors.length > 0 && <MentorGrid />}    // Show results
```
This pattern ensures only ONE state is visible at a time.

### `components/MentorCard/MentorCard.tsx`:

```typescript
interface MentorCardProps {
  mentor: User;                          // The mentor data to display
  onBookSession: (mentor: User) => void; // Callback when "Book Session" is clicked
}
```

**Props are inputs**: The parent component (`MentorsPage`) passes data DOWN to children
via props. Children communicate UP by calling callback functions (like `onBookSession`).

```
MentorsPage (has the data & state)
  ├── SkillFilter (receives allSkills, selectedSkills, onToggleSkill callback)
  ├── MentorCard (receives mentor, onBookSession callback)
  └── BookingModal (receives selectedMentor, onClose callback, onSuccess callback)
```

### `components/BookingModal/BookingModal.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // Stop the form from reloading the page (default browser behavior)

  // Client-side validation
  if (!date || !time) { setError('Please select both a date and time.'); return; }

  const scheduledAt = new Date(`${date}T${time}`).toISOString();
  // Combines "2026-03-15" + "14:00" → "2026-03-15T14:00:00.000Z"

  if (scheduledAt <= new Date().toISOString()) {
    setError('Please select a future date and time.'); return;
  }

  setLoading(true);  // Show spinner on submit button

  try {
    await api.createSession({ mentorId: mentor.id, menteeId: DEMO_MENTEE_ID, scheduledAt });
    // ↑ POST request to backend

    setSuccessMessage('Session booked successfully! 🎉');
    setTimeout(() => { onSuccess(); onClose(); }, 1500);
    // ↑ Wait 1.5 seconds to show success message, then close modal

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to book session.');
    // ↑ Show error from backend (e.g., "mentorId is required")
  } finally {
    setLoading(false);  // Hide spinner regardless of success/failure
  }
};
```

**Modal overlay pattern**:
```tsx
<div className="overlay" onClick={onClose}>         {/* Click backdrop → close */}
  <div className="modal" onClick={(e) => e.stopPropagation()}>
    {/* stopPropagation prevents clicks INSIDE the modal from bubbling up to the overlay */}
    ...form content...
  </div>
</div>
```

---

## 12. Step 11 — Trace a Full User Action End-to-End

### Scenario: User clicks "Book Session" on Alice's card

```
1. [MentorCard] User clicks "Book Session" button
     → onClick={() => onBookSession(mentor)}
     → calls handleBookSession(aliceObject) in MentorsPage

2. [MentorsPage] handleBookSession sets state:
     → setSelectedMentor(aliceObject)
     → React re-renders, now selectedMentor !== null
     → <BookingModal mentor={aliceObject} /> appears

3. [BookingModal] User fills in date: "2026-03-15", time: "14:00"
     → onChange handlers update local state: setDate('2026-03-15'), setTime('14:00')

4. [BookingModal] User clicks "Confirm Booking"
     → handleSubmit fires
     → Validation passes
     → setLoading(true) → button shows spinner
     → api.createSession({ mentorId: alice.id, menteeId: 'demo-001', scheduledAt: '...' })

5. [api.ts] fetch() sends HTTP request:
     POST http://localhost:3000/api/sessions
     Body: { "mentorId": "abc-123", "menteeId": "demo-001", "scheduledAt": "2026-03-15T14:00:00.000Z" }

6. [Vite Proxy] Forwards to http://localhost:5000/api/sessions

7. [server.ts] Express matches app.use('/api/sessions', sessionRoutes)

8. [sessionRoutes.ts] Matches router.post('/', sessionController.create)

9. [SessionController.create] Reads req.body → validates fields present
     → calls this.sessionService.create({ mentorId, menteeId, scheduledAt })

10. [SessionService.create] Validates fields → validates date
      → creates new Session(uuidv4(), ..., 'pending', ...)
      → pushes to this.sessions array
      → returns the session object

11. [SessionController.create] Receives session object
      → res.status(201).json({ success: true, data: session })

12. [api.ts] fetch() receives 201 response → .json() parses it → returns to BookingModal

13. [BookingModal] try block succeeds
      → setSuccessMessage('Session booked successfully! 🎉')
      → setTimeout → 1500ms later → onSuccess() → onClose()

14. [MentorsPage] onClose → setSelectedMentor(null) → modal disappears
```

---

## 13. Design Patterns Cheat-Sheet

| Pattern | Where | How It Works |
|---------|-------|-------------|
| **MVC** | Entire backend | **M**odels define data, **C**ontrollers handle HTTP, routes are the "Views" (API responses) |
| **Service Layer** | `/services/` | Business logic is separated from HTTP handling — Services know nothing about Express |
| **Dependency Injection** | Controllers | `new UserController(userService)` — the controller receives its dependency from outside, rather than creating it internally |
| **DTO (Data Transfer Object)** | `CreateSessionDTO` | A simple object that carries data between layers (route → controller → service) |
| **Barrel Exports** | Every `index.ts` | Re-export pattern for clean imports: `import { X } from '../folder'` |
| **Repository Pattern (simplified)** | Services | Services act as the data access layer with methods like `getAll()`, `findById()`, `create()` |
| **Component Composition** | Frontend | MentorsPage is composed of MentorCard + SkillFilter + BookingModal |
| **Lifting State Up** | MentorsPage | Shared state (selectedMentor, selectedSkills) lives in the parent, passed down via props |
| **Container/Presenter** | MentorsPage vs MentorCard | MentorsPage manages data/logic; MentorCard just displays what it receives |

---

## 14. Key TypeScript Concepts Used

### `Omit<Type, Keys>` — Remove fields from a type
```typescript
Omit<IUser, 'password'>  // IUser but WITHOUT the password field
// Result: { id, name, email, role, skills, bio }
```

### `type X = 'a' | 'b'` — Union types (string literals)
```typescript
type UserRole = 'mentor' | 'mentee';
// A variable of type UserRole can ONLY be 'mentor' or 'mentee'
```

### `interface` vs `class`
```typescript
interface IUser { ... }  // Just a shape — exists only at compile time, gone in JavaScript
class User { ... }       // A real object constructor — exists at runtime with methods
```

### Generics `<T>`
```typescript
ApiResponse<User[]>   // T = User[] → { success: boolean, data: User[], ... }
ApiResponse<Session>  // T = Session → { success: boolean, data: Session, ... }
// Same interface, different data types — that's the power of generics
```

### `?` — Optional properties/parameters
```typescript
filters?: { role?: UserRole }
// filters itself is optional (can be undefined)
// role inside filters is also optional
// filters?.role — safe access: if filters is undefined, returns undefined instead of crashing
```

### Arrow functions for `this` binding
```typescript
public getAll = (req: Request, res: Response): void => { ... }
// Arrow function (=) preserves 'this' context
// Regular method would lose 'this' when Express calls it as a callback
```

---

## 15. Quick Reference: File → Purpose Map

### Backend
| File | Purpose | Key Export |
|------|---------|-----------|
| `server.ts` | Entry point, Express setup, starts listening | `App` class |
| `models/User.ts` | User data shape + class with `toSafeObject()` | `User`, `IUser`, `UserRole` |
| `models/Session.ts` | Session data shape + class | `Session`, `ISession`, `SessionStatus` |
| `services/UserService.ts` | In-memory user storage, filtering, seed data | `UserService` class |
| `services/SessionService.ts` | Session creation, status updates, validation | `SessionService` class |
| `controllers/UserController.ts` | Handles GET /api/users, reads query params | `UserController` class |
| `controllers/SessionController.ts` | Handles POST & PATCH for sessions | `SessionController` class |
| `routes/userRoutes.ts` | Wires GET / → UserController.getAll | Express Router |
| `routes/sessionRoutes.ts` | Wires POST /, PATCH /:id/status | Express Router |
| `middleware/errorHandler.ts` | Catches unhandled errors, returns JSON | `errorHandler` function |

### Frontend
| File | Purpose | Key Export |
|------|---------|-----------|
| `main.tsx` | React entry point, mounts app into DOM | — |
| `App.tsx` | Root component, renders MentorsPage | `App` |
| `types/index.ts` | Shared TypeScript types | `User`, `Session`, `ApiResponse` |
| `services/api.ts` | HTTP client with fetch() calls | `api` object |
| `pages/MentorsPage/` | Main page — data fetching, state, layout | `MentorsPage` |
| `components/MentorCard/` | Displays single mentor info + book button | `MentorCard` |
| `components/SkillFilter/` | Sidebar with toggleable skill chips | `SkillFilter` |
| `components/BookingModal/` | Modal form — date/time picker, POST session | `BookingModal` |

---

> **Final tip**: When reading any new codebase, ask yourself three questions about each file:
> 1. **What data does it receive?** (parameters, props, request body)
> 2. **What does it do with that data?** (transform, validate, filter, store)
> 3. **What does it return/output?** (response, rendered UI, callback)
>
> Answer those three questions for each file and you will understand any project.
