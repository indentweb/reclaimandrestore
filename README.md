# Reclaim & Restore — Mobile Auto Detailing

Marketing website for **Reclaim & Restore**, a mobile auto detailing company
serving North Alabama. Built with Next.js (App Router), TypeScript, and
Tailwind CSS.

## Features

- Dark **black / blue / white** theme matching the brand.
- Home page sections: Hero, Services (steam, shampoo, full interior, exterior),
  How It Works, **Our Work** gallery, Service Area, **Book a Date** form, and a
  call-to-action contact block.
- A dedicated **Gallery page** (`/gallery`) and an owner **dashboard**
  (`/admin`) for uploading photos.
- Click-to-call phone links throughout (contact is phone-first).
- A **booking request form** that emails the business owner the details
  (vehicle, services, preferred date, location/notes).

## Photo gallery & owner dashboard

The owner can upload work photos at **`/admin`** (also linked as "Owner login"
in the footer). It's protected by the `ADMIN_PASSWORD` environment variable —
uploads are disabled until that's set. Uploaded images are written to
`public/gallery/` and appear automatically on the home page and `/gallery`.

> **Hosting note:** file uploads persist on a server with a writable, permanent
> disk (e.g. running `npm start` on a VPS, or local development). On serverless
> platforms like Vercel the filesystem is read-only/ephemeral, so for that setup
> the gallery should be backed by object storage (e.g. Vercel Blob or S3) —
> happy to wire that up on request. You can also just commit images directly
> into `public/gallery/` and redeploy.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Booking form email setup

The booking form posts to `/api/book`. There are two modes:

1. **Out of the box (no setup):** if no email API key is configured, the form
   opens the visitor's email app pre-filled with their request, addressed to
   `NEXT_PUBLIC_BOOKING_EMAIL`. No lead is lost.
2. **Automatic email (recommended):** add a free [Resend](https://resend.com)
   API key and the server sends each request straight to the owner's inbox.

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key — enables automatic email sending. |
| `BOOKING_EMAIL` | Inbox that receives booking requests. |
| `NEXT_PUBLIC_BOOKING_EMAIL` | Address used for the mailto fallback. |
| `BOOKING_FROM_EMAIL` | Optional verified "from" address. |
| `ADMIN_PASSWORD` | Password for the `/admin` photo dashboard. Uploads disabled if unset. |

## Updating business details

All phone, email, service-area, and service copy lives in
[`src/lib/site.ts`](src/lib/site.ts) — edit it there in one place.

Brand images live in [`public/brand/`](public/brand).

## Deploying

Deploy to any host that supports Next.js (Vercel is the simplest — one click).
Remember to add the environment variables in your host's dashboard.

```bash
npm run build
npm start
```
