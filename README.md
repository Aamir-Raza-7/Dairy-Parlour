# Sahil's Dairy — Dairy-Parlour

**Project:** A lightweight Node.js + Express backend and static frontend for a dairy parlour demo. The server provides product listings, order placement & tracking, user auth (JWT), subscriptions, and franchise enquiries. It will automatically fall back to an in-memory datastore when MongoDB is not available so the app works out-of-the-box.

**Contents:**
- **server.js**: Express server and API routes
- **index.html / main.js / products.js**: Simple static frontend served from the project root
- **models.js**: Mongoose schemas (used when MongoDB is connected)
- **defaultData.js**: Seed data for products & booths

**Quick Start**

Prerequisites:
- **Node.js** v16+ installed
- **npm** (comes with Node.js)
- Optional: **MongoDB** if you want persistent storage (the app works without it using an in-memory fallback)

1. Install dependencies

```
npm install
```

2. Configure environment variables

Copy or create a `.env` file in the project root. Example values:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/sahil_dairy
JWT_SECRET=your_jwt_secret_here
```

Notes:
- If MongoDB is not running or `MONGODB_URI` is omitted/invalid, the server falls back to an in-memory database (data will not persist across restarts).

3. Run the server

- Development (auto-restarts on file changes): `npm run dev` (requires `nodemon` — already listed in devDependencies)
- Production / normal run: `npm start`

Open the frontend at: http://localhost:3000

API Summary (main endpoints)
- **Auth:** `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- **Products:** `GET /api/products`
- **Booths:** `GET /api/booths`
- **Orders:** `POST /api/orders`, `GET /api/orders/:id`
- **Subscriptions:** `POST /api/subscriptions`, `GET /api/user/subscriptions` (auth required)
- **Franchise:** `POST /api/franchises`

Authentication:
- The app uses JWT tokens. After login/signup the response contains a `token`. Send it in requests that require authentication using the header `Authorization: Bearer <token>`.

Seeding & Demo Data
- On first successful MongoDB connection the server will automatically seed products, booths and mock orders from `defaultData.js` and the `defaultOrders` defined in `server.js`.
- If MongoDB is unavailable the server prints a warning and uses an in-memory fallback pre-populated with demo data so the frontend and APIs behave the same for testing.

Troubleshooting
- If the server reports it cannot connect to MongoDB, either start a local MongoDB instance or rely on the in-memory fallback for development/testing.
- Check `.env` values and ensure `MONGODB_URI` points to a running MongoDB when persistence is required.

Useful commands
- Install: `npm install`
- Start (prod): `npm start`
- Start (dev): `npm run dev`

Where to look
- Server entry: [server.js](server.js)
- Models: [models.js](models.js)
- Frontend entry: [index.html](index.html)

License
- MIT-style (no license file included in this repo)

Enjoy exploring the Dairy-Parlour demo!