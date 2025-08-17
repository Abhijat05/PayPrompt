# Water Can Ledger Management System (PayPrompt)

A full-stack application to manage a water-can delivery business: customers, orders, inventory and payments.

---

## Quickstart

1. Clone repository and open workspace.
2. Start the backend and frontend in separate terminals.
3. Make sure environment files are created (see "Environment" section).

This README contains step-by-step run instructions and links to the most relevant files and APIs.

---

## Prerequisites

- Node.js (>= 16)
- npm or pnpm
- MongoDB instance (local or Atlas)
- Clerk account (for authentication) — optional in development (there are dev fallbacks)

---

## Environment files

- Backend: copy and edit [backend/.env.example](backend/.env.example) -> [backend/.env](backend/.env)
- Frontend: copy and edit [frontend/.env.local.example](frontend/.env.local.example) -> [frontend/.env.local](frontend/.env.local)

Important values to set:
- MongoDB connection string (in backend .env)
- Clerk API keys / frontend keys (if using Clerk)
- Any API URLs if you change ports

---

## Ports / defaults

- Backend: http://localhost:3000 (API endpoints used by frontend)
  - See CORS origin configured in [backend/src/app.js](backend/src/app.js)
- Frontend (Vite): http://localhost:5173
  - See [frontend/index.html](frontend/index.html)

---

## Run backend

1. Open terminal
2. cd backend
3. npm install
4. Create `.env` from `.env.example`
5. Start:

- Production-like: node server.js (or npm start if script exists)
- Development: npm run dev (if `dev` script uses nodemon / vite)

Primary server entry: [backend/server.js](backend/server.js) and Express app: [backend/src/app.js](backend/src/app.js)

Key backend controllers and middleware:
- Inventory controller: [`getInventoryHistory`](backend/src/controllers/inventoryController.js) — [backend/src/controllers/inventoryController.js](backend/src/controllers/inventoryController.js)
- Customer controller: [backend/src/controllers/customerController.js](backend/src/controllers/customerController.js)
- Order controller: [backend/src/controllers/orderController.js](backend/src/controllers/orderController.js)
- Notification controller: [backend/src/controllers/notificationController.js](backend/src/controllers/notificationController.js)
- Authentication middleware: [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js)
- Role middleware: [backend/src/middleware/roleMiddleware.js](backend/src/middleware/roleMiddleware.js)

Routes of interest:
- Notifications routes: [backend/src/routes/notificationRoutes.js](backend/src/routes/notificationRoutes.js)
- Main routes registration: [backend/src/routes/index.js](backend/src/routes/index.js)

---

## Run frontend

1. Open terminal
2. cd frontend
3. npm install
4. Create `.env.local` from `.env.local.example`
5. Start dev server:
   - npm run dev

Primary frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx) and HTML host: [frontend/index.html](frontend/index.html)

API client utilities: [frontend/src/lib/api.js](frontend/src/lib/api.js)
- Helpful client functions: [`addBalance`](frontend/src/lib/api.js), [`removeBalance`](frontend/src/lib/api.js), [`getCustomerById`](frontend/src/lib/api.js), and the customer update function [`updateCustomerBalance`](frontend/src/lib/api.js) — open the file for exact implementations.

Key pages/components to inspect:
- Customers page and subviews: [frontend/src/pages/CustomersPage.jsx](frontend/src/pages/CustomersPage.jsx)
- Customer detail: [frontend/src/pages/CustomerDetailPage.jsx](frontend/src/pages/CustomerDetailPage.jsx)
- Inventory page: [frontend/src/pages/InventoryPage.jsx](frontend/src/pages/InventoryPage.jsx)
- Transactions page: [frontend/src/pages/TransactionsPage.jsx](frontend/src/pages/TransactionsPage.jsx)
- Header & navigation: [frontend/src/components/Header.jsx](frontend/src/components/Header.jsx)
- Can return dialog: [frontend/src/components/CanReturnDialog.jsx](frontend/src/components/CanReturnDialog.jsx)
- Customer balance management: [frontend/src/components/CustomerBalanceManagement.jsx](frontend/src/components/CustomerBalanceManagement.jsx)

---

## Typical dev workflow

- Start MongoDB locally or ensure Atlas is reachable and set the URI in backend `.env`.
- Start backend: cd backend && npm run dev (or node server.js)
- Start frontend: cd frontend && npm run dev
- Open http://localhost:5173 in browser and sign in (Clerk). For development, the app contains dev fallbacks to set roles based on email.

---

## Common troubleshooting

- "Cannot connect to MongoDB": verify MONGODB_URI in [backend/.env](backend/.env) and that MongoDB is running.
- CORS issues: backend CORS origin set in [backend/src/app.js](backend/src/app.js) to 'http://localhost:5173'. Update if frontend runs on a different origin.
- Authentication / Clerk errors: confirm Clerk keys in both backend `.env` and frontend `.env.local` (see files mentioned above). In development, Clerk calls are gracefully degraded (check [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js) and [backend/src/middleware/roleMiddleware.js](backend/src/middleware/roleMiddleware.js)).
- 401 / invalid token: make sure tokens sent from frontend are included in requests (Authorization: Bearer <token>) — frontend services in [frontend/src/lib/api.js](frontend/src/lib/api.js) add Authorization headers.

---

## Where to find features (quick map)

- API root / request registration: [backend/src/app.js](backend/src/app.js)
- Inventory logic and history diff: [backend/src/controllers/inventoryController.js](backend/src/controllers/inventoryController.js) — see the [`getInventoryHistory`](backend/src/controllers/inventoryController.js) handler.
- Customer APIs and transaction pagination: [backend/src/controllers/customerController.js](backend/src/controllers/customerController.js)
- Orders APIs: [backend/src/controllers/orderController.js](backend/src/controllers/orderController.js)
- Frontend API client: [frontend/src/lib/api.js](frontend/src/lib/api.js)
- Frontend route definitions & protected routes: [frontend/src/App.jsx](frontend/src/App.jsx)
- Pages: [frontend/src/pages/](frontend/src/pages/) — Customers, Inventory, Reports, Notifications, Transactions

---

## Deployment notes

- Build frontend: from /frontend run `npm run build` (creates `dist` for static hosting).
- Backend: ensure production environment variables (DB, Clerk) are set. Use a process manager (pm2) or containerize.
- If deploying separately, update API base URLs in frontend `.env.local`.

---

## Handing over

- Ensure recipients have:
  - Access to MongoDB (or sample data export)
  - Clerk keys (or run in development mode)
  - A short note about which ports you used (backend=3000, frontend=5173)
- Point them to this file and the key files listed above (routes, controllers, middleware) for fast onboarding.

---
