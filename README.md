# AgooBiz Connect Introduction

**Leader**

- Rivales, Stephanie E.
  
**Members**
  
- Amer, Monica R.
- Dosono, John Derick R.
- Estacio, Angelica R.
- Refuerzo, Daniel M.

## AgooBiz Connect

**Occasion food, from Agoo's home kitchens.**

AgooBiz Connect is a web marketplace that connects verified home-based food sellers in **Agoo, La Union, Philippines** with buyers preordering food for birthdays, fiestas, weddings, Christmas/Noche Buena, baptismals, graduations, and other celebrations. Sellers list occasion-ready dishes (lechon, pancit malabon, biko, kakanin, party trays, and more); buyers browse by occasion, order, and pick up or arrange delivery.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [User Roles](#user-roles)
- [API Reference](#api-reference)
- [Known Limitations / Roadmap](#known-limitations--roadmap)

---

## Overview

Home-based food businesses are common in Agoo, La Union, especially around town fiestas and family celebrations, but they're hard to discover outside word-of-mouth. AgooBiz Connect gives these sellers a storefront and gives buyers a single place to search occasion food by category, place an order, and track it — while giving the platform a lightweight verification step so buyers can trust that sellers are real and based in Agoo.

## Key Features

**For buyers**
- Browse and search occasion food by category (Birthday, Fiesta, Wedding, Christmas/Noche Buena, Baptismal, Graduation, Wake/Lamay)
- Product detail pages with seller info, price, and stock
- Cart with quantity controls
- Checkout with delivery details (name, phone, address, notes) and a choice of payment method (Cash on Delivery, GCash, Card)
- Order history with live status (Preparing → Out for Delivery → Delivered)
- In-app chat with sellers

**For sellers**
- Seller registration with identity/location verification:
  - Complete address + barangay
  - GPS shop location (captured via the browser's Geolocation API, confirmed on an embedded map)
  - Proof of address upload (barangay certificate, utility bill, or valid ID)
  - Valid government ID upload
  - Accounts start as `pending` and must be approved before the seller can list products
- Product management (create/edit listings once approved)
- Order management (view and update order status)
- Access to platform-wide demand analytics

**For admins**
- User management (seller verification approval — in progress, see [Roadmap](#known-limitations--roadmap))
- Platform-wide order and user oversight

**Platform-wide**
- Public demand analytics (weekly order trend, category demand, top sellers, demand by barangay) — visible without logging in
- Role-aware navigation and dashboards (guest / buyer / seller / admin all see a different `/` home view)

## Tech Stack

**Frontend**
- React 19 (Create React App / `react-scripts`)
- React Router v6
- Axios
- Plain CSS (no framework) with a warm orange/cream design system

**Backend**
- Node.js + Express 5
- PostgreSQL via Sequelize ORM
- JWT-based authentication (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- File uploads (seller verification documents) via `multer`

The frontend and backend live in the same `agoobiz-connect/` package and are run as two separate processes in development (see [Running the App](#running-the-app)).

## Project Structure

```
AgooBiz Connect/
├── Documents/                  # Project docs/notes
├── agoobiz-connect/
│   ├── index.js                 # Express app entry point
│   ├── config/
│   │   └── database.js          # Sequelize/PostgreSQL connection
│   ├── models/                  # Sequelize models (User, Product, Order, OrderItem, Review, Message, Announcement)
│   ├── routes/                  # Express routes (auth, users, products, orders, reports, messages, reviews, announcements)
│   ├── middleware/               # auth, requireRole, upload (multer)
│   ├── lib/                     # Shared helpers (response envelopes)
│   ├── uploads/                 # Seller verification documents (gitignored)
│   └── src/
│       ├── api/                 # Axios wrappers per resource (productsApi, ordersApi, reportsApi, api.js)
│       ├── components/          # Header, Footer, ProductCard, Dropdown, ScrollToHash, SplashScreen, ProtectedRoute
│       ├── context/              # AuthContext, CartContext, AuthPromptContext
│       ├── pages/                # Route-level pages (Home, Shop, ProductDetail, Cart, Checkout, MyOrders, Register, Login, Chat, Analytics, dashboards)
│       └── styles/               # Per-feature CSS files, imported through App.css
└── package.json / package-lock.json
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) running locally (or a connection string to a hosted instance)
- npm

### Installation

```bash
git clone https://github.com/StephanieRivales/AgooBiz_Connect.git
cd "AgooBiz Connect/agoobiz-connect"
npm install
```

Create a PostgreSQL database matching whatever you set as `DB_NAME` below (default: `agoobiz`).

## Environment Variables

Create a `.env` file inside `agoobiz-connect/`:

```env
# Database
DB_NAME=agoobiz
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Backend server port (do NOT use PORT — that variable is also read by
# react-scripts and will make the frontend and backend fight over the
# same port)
API_PORT=5000

# Auth
JWT_SECRET=replace-with-a-long-random-string
```

> ⚠️ Never commit `.env` — it's covered by `.gitignore`, but double-check it isn't already tracked in your git history if you initialized the repo before adding the ignore rule.

## Running the App

The frontend and backend run as **two separate processes**. Open two terminals in `agoobiz-connect/`:

**Terminal 1 — backend (Express + PostgreSQL):**
```bash
npm run server
```
Starts the API on `http://localhost:5000` (or whatever `API_PORT` is set to). On first run, Sequelize syncs the models to your database automatically.

**Terminal 2 — frontend (React dev server):**
```bash
npm start
```
Starts the app on `http://localhost:3000`.

Uploaded seller verification documents are served from `http://localhost:5000/uploads/...` and saved to `agoobiz-connect/uploads/verification/`.

## User Roles

| Role   | Can do |
|--------|--------|
| Guest  | Browse products, view public analytics, register as buyer or seller |
| Buyer  | Everything a guest can, plus: add to cart, checkout, view order history, chat with sellers |
| Seller | Register with verification documents (starts `pending`); once `approved`, can list/manage products and fulfill orders |
| Admin  | Platform oversight — user and order management |

Seller accounts require `verificationStatus: "approved"` before they can create product listings. This is currently set manually by an admin via a direct API call to `PUT /api/users/:id` (see [Roadmap](#known-limitations--roadmap) — an in-app approval screen is planned but not yet built).

## API Reference

All endpoints are prefixed with `/api`. Responses are wrapped as `{ success: boolean, data }` or `{ success: false, message }`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register as buyer or seller (multipart/form-data for sellers, to include verification files) |
| POST | `/auth/login` | — | Log in, returns a JWT |
| GET | `/products` | — | List products |
| POST | `/products` | Seller (approved) | Create a product |
| GET | `/products/:id` | — | Get one product |
| GET | `/orders` | Any logged-in role | List orders relevant to the current user |
| POST | `/orders` | Buyer | Place an order from cart items + delivery details |
| PUT | `/orders/:id/status` | Seller/Admin | Update an order's status |
| GET | `/reports/weekly-trend` | — | Public: order volume over time |
| GET | `/reports/category-demand` | — | Public: demand by occasion category |
| GET | `/reports/top-sellers` | — | Public: top-performing sellers |
| GET | `/reports/barangay-demand` | — | Public: demand by barangay |
| GET | `/reports/public-summary` | — | Public: platform-wide summary stats |
| PUT | `/users/:id` | Admin | Update any user (including `verificationStatus`) |

## Known Limitations / Roadmap

- **No in-app seller approval screen yet.** Sellers register and land in `pending` status; an admin currently has to approve them via a direct `PUT /api/users/:id` call rather than through the UI.
- **Admin dashboard shows placeholder stats**, not live data.
- **`/admin/users` and `/admin/settings`** are referenced by the nav but not yet wired up as routes.
- **No 404 page** for unmatched routes.
- Analytics/demand data is served from the backend's report endpoints; product/order data shown in some areas may still include design-time sample data pending a full pass to connect every screen to the live API.

---

*AgooBiz Connect — Agoo Public Market, La Union, Philippines*
