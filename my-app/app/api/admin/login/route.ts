import { NextResponse } from "next/server";

import { getCrmServerBaseUrl, isLocalhostUrl, vercelCrmHint } from "@/lib/crm-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ detail: "Email and password required" }, { status: 400 });
  }

  const CRM = getCrmServerBaseUrl();
  if (isLocalhostUrl(CRM) && process.env.VERCEL) {
    return NextResponse.json({ detail: vercelCrmHint() }, { status: 503 });
  }

  try {
    const res = await fetch(`${CRM}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { detail: "CRM недоступен", hint: vercelCrmHint(), error: message },
      { status: 503 }
    );
  }
}
