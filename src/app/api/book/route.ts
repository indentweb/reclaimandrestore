import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string;
  phone?: string;
  vehicle?: string;
  service?: string;
  date?: string;
  notes?: string;
};

export async function POST(request: Request) {
  let body: BookingPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const vehicle = (body.vehicle ?? "").trim();
  const service = (body.service ?? "").trim();
  const date = (body.date ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!name || !phone || !vehicle) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  // Insert using a raw fetch with just the apikey header (anon role).
  // The bookings table has an RLS INSERT policy for the anon role so
  // this works without a service-role JWT.
  try {
    const res = await fetch(`${url}/rest/v1/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name,
        phone,
        vehicle,
        service: service || null,
        preferred_date: date || null,
        notes: notes || null,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[book] insert failed:", res.status, detail);
      return NextResponse.json({ ok: false, error: "Failed to save booking" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[book] fetch failed:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
