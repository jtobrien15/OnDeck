# OnDeck — Aquatics Program Manager

A web application that manages the student lifecycle for Red Cross aquatics certification programs at the YMCA. It fills the operational gap between SGA Software (registration/payment) and the Red Cross LMS (certification), automating student communication, prerequisite tracking, class balancing, instructor coordination, and certification export.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Email**: Resend + React Email
- **Hosting**: Vercel
- **Scheduled Jobs**: Vercel Cron

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase and Resend credentials.

### 3. Set up the database

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed SystemSettings
```

### 4. Run the dev server

```bash
npm run dev
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Full database schema
│   └── seed.ts            # SystemSettings seed
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Shared UI components
│   ├── emails/            # React Email templates
│   ├── lib/
│   │   ├── db.ts          # Prisma singleton
│   │   ├── lifecycle.ts   # Enrollment state machine (single source of truth)
│   │   └── utils.ts       # Utilities
│   └── types/             # TypeScript types
└── docs/
    └── IMPLEMENTATION_GUIDE.md
```

## Build Phases

- **Phase 1** (current): Foundation — schema, CSV import, dashboard, student pipeline, manual status updates, email templates
- **Phase 2**: Automation — automated emails, instructor checklist, LMS export, waitlist management, transfers
- **Phase 3**: Polish — public info page, multi-location, certifications, alerts
