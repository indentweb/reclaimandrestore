import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string;
  phone?: string;
  vehicle?: string;
  service?: string;
  date?: string;
  notes?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

  if (!name || !phone || !vehicle) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_EMAIL ?? process.env.NEXT_PUBLIC_BOOKING_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL ?? "Reclaim & Restore <onboarding@resend.dev>";

  // If email isn't configured yet, tell the client to fall back to a mailto:
  // link so the lead is never dropped.
  if (!apiKey || !to) {
    return NextResponse.json({ ok: false, fallback: true });
  }

  const fields: [string, string][] = [
    ["Name", name],
    ["Phone", phone],
    ["Vehicle", vehicle],
    ["Service", (body.service ?? "").trim() || "Not specified"],
    ["Preferred date", (body.date ?? "").trim() || "Flexible"],
    ["Location / notes", (body.notes ?? "").trim() || "—"],
  ];

  const html = `
    <h2 style="font-family:sans-serif;color:#0c3f8f;">New booking request</h2>
    <table style="font-family:sans-serif;border-collapse:collapse;">
      ${fields
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 14px 6px 0;font-weight:600;color:#333;">${label}</td><td style="padding:6px 0;color:#111;">${escapeHtml(
              value,
            )}</td></tr>`,
        )
        .join("")}
    </table>
  `;
  const text = fields.map(([label, value]) => `${label}: ${value}`).join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `New booking request — ${name}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend error:", detail);
      return NextResponse.json(
        { ok: false, fallback: true },
        { status: 200 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Booking email failed:", err);
    return NextResponse.json({ ok: false, fallback: true });
  }
}
