# Job Portal API

A production-grade REST API for a developer job portal.  
Built with Node.js, Express, PostgreSQL, Redis, and BullMQ.

## Features
- Role-based auth (candidate / employer) with JWT + refresh tokens
- Job posting, searching, and filtering by skills/location
- Application flow with status tracking
- CV upload (Cloudinary)
- Email notifications via queue (BullMQ + Nodemailer)
- Rate limiting, input validation, Swagger docs

## Tech stack
- **Runtime:** Node.js 20
- **Framework:** Express
- **Database:** PostgreSQL (via node-pg-migrate)
- **Cache/Queue:** Redis + BullMQ
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Docs:** Swagger UI

## Getting started

```bash
git clone https://github.com/yourname/job-board-api
cd job-board-api
nvm use
npm install
cp .env.example .env   # fill in your values
npm run migrate:up     # run DB migrations
npm run dev            # start dev server
```

## Environment variables
See `.env.example` for all required variables.

## API docs
Once running, visit: http://localhost:3000/api-docs

## Running tests
```bash
npm test
npm run test:coverage
```

## Project structure
```
src/
  routes/        # Express routers
  controllers/   # Route handlers
  middleware/    # Auth, validation, error handling
  validators/    # Zod schemas
  services/      # Email, upload, queue
  utils/         # JWT, hash helpers
  db/            # DB pool + migrations
  config/        # Env var config
```