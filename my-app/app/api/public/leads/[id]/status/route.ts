import { NextResponse } from "next/server";

import { getCrmServerBaseUrl, isLocalhostUrl, vercelCrmHint } from "@/lib/crm-server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || Number.isNaN(Number(id))) {
    return NextResponse.json({ detail: "Invalid id" }, { status: 400 });
  }

  const CRM = getCrmServerBaseUrl();
  if (isLocalhostUrl(CRM) && process.env.VERCEL) {
    return NextResponse.json({ detail: vercelCrmHint() }, { status: 503 });
  }

  try {
    const res = await fetch(`${CRM}/public/leads/${id}/status`, {
      method: "PATCH",
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
