# DriverZone

DriverZone is a sophisticated driver booking platform designed for real-time service management. It enables customers to book drivers for various trip types, provides an administrative dashboard for management, and features real-time driver tracking and automated background processes.

## Key Features

- 🚗 **Real-time Driver Tracking**: Leverages Socket.io for live updates of driver locations and statuses.
- 📅 **Advanced Booking System**: Supports on-demand bookings, scheduled trips, and package-based services.
- 🗺️ **Geofencing & Zone Management**: Admin-defined service zones using Leaflet and GeoJSON for precise operation control.
- 💳 **Secure Payments**: Integrated with Razorpay for seamless and secure financial transactions.
- 📱 **Omnichannel Notifications**: Supports WhatsApp integration and Firebase Push Notifications for alerts.
- 📊 **Admin Dashboard**: Comprehensive management of drivers, customers, bookings, and coupons.
- 🤖 **Automated Workflows**: Background cron jobs for driver status maintenance and stale data cleanup.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Maps & GIS**: [Leaflet](https://leafletjs.org/), [React Leaflet](https://react-leaflet.js.org/), [@turf/turf](https://turfjs.org/)
- **Media Management**: [Cloudinary](https://cloudinary.com/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Scheduling**: [node-cron](https://www.npmjs.com/package/node-cron)

## Prerequisites

- **Node.js**: v20.x or higher
- **MongoDB**: A running instance (local or Atlas)
- **Package Manager**: `npm` (preferred)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/therebootai/driverzone
cd driverzone/website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Refer to the [Environment Variables](#environment-variables) section for detailed configuration.

### 4. Start Development Server

This project uses a custom server (`server.ts`) to handle Socket.io and background cron jobs.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Architecture

### Directory Structure

```
├── server.ts             # Custom HTTP + Socket.io + Cron server
├── src/
│   ├── app/              # Next.js App Router (Pages & API)
│   │   ├── (protected)/  # Authenticated routes (Admin Dashboard)
│   │   └── api/          # Backend API endpoints
│   ├── components/       # Reusable React components
│   ├── models/           # Mongoose Database Models
│   ├── services/         # Business logic & external API integrations
│   ├── lib/              # Library initializations (Socket, Firebase, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── actions/          # Next.js Server Actions
│   ├── db/               # Database connection logic
│   └── utils/            # Utility functions
├── public/               # Static assets
└── .env.example          # Template for environment variables
```

### Key Components

- **Custom Server**: The `server.ts` file extends the standard Next.js server to initialize Socket.io and `node-cron`.
- **Socket Service**: Located in `src/lib/socket.ts`, handles real-time connections for driver location updates.
- **Cron Jobs**: Automated tasks (like `autoOfflineStaleDrivers`) run every 15 minutes to ensure system integrity.
- **Geospatial Logic**: Uses `@turf/turf` for complex map operations and zone boundary checks.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | Connection string for MongoDB |
| `SECRET_KEY` | Secret for JWT authentication |
| `API_URI` | Base URL of the application (e.g., http://localhost:3000) |
| `RAZORPAY_SECRET_ID` | Razorpay API Key ID |
| `RAZORPAY_SECRET_KEY` | Razorpay API Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK Private Key |

*See `.env.example` for the full list of required variables.*

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the custom development server with `tsx` |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint for code quality checks |

## Development Workflows

### Database Models
Models are defined in `src/models/`. When adding a new field, ensure you update the corresponding TypeScript interface in `src/types/`.

### Real-time Updates
To emit or listen to socket events, use the `socketService` helper or the client-side socket context.

### Background Tasks
Background processes should be added to the `server.ts` file using the `cron.schedule` pattern.

## Troubleshooting

- **Socket connection fails**: Ensure you are running `npm run dev` (which uses `server.ts`) instead of `next dev`.
- **Database errors**: Verify your `MONGODB_URI` is correctly formatted and accessible.
- **Leaflet build issues**: Leaflet requires a browser environment; ensure any map components are rendered client-side (`"use client"`).

## License

Copyright © 2026 Reboot AI. All rights reserved.
