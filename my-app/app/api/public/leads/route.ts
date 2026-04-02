import { NextResponse } from "next/server";

import { getCrmServerBaseUrl, isLocalhostUrl, vercelCrmHint } from "@/lib/crm-server";

export const dynamic = "force-dynamic";
/** Vercel: дать прокси дождаться Render + Google (hobby всё равно ~10s max). */
export const maxDuration = 60;

export async function POST(request: Request) {
  const CRM = getCrmServerBaseUrl();
  if (isLocalhostUrl(CRM) && process.env.VERCEL) {
    return NextResponse.json({ detail: vercelCrmHint() }, { status: 503 });
  }

  try {
    const res = await fetch(`${CRM}/public/leads`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body: await request.text(),
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
