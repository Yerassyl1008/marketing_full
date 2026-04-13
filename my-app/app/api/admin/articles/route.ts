import { NextResponse } from "next/server";

import { revalidateArticlePaths, revalidateBlogPaths } from "@/lib/articles/revalidate-blog";
import { getCrmServerBaseUrl } from "@/lib/crm-server";
import { getBearerToken, verifyAdminBearerToken } from "@/lib/verify-admin-bearer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const v = await verifyAdminBearerToken(token);
  if (!v.ok) {
    return NextResponse.json(
      {
        detail: "Unauthorized",
        reason: v.reason,
        ...(v.detail ? { hint: v.detail } : {}),
      },
      { status: 401 },
    );
  }

  const res = await fetch(`${getCrmServerBaseUrl()}/articles`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!res.ok) {
    return NextResponse.json({ detail: "CRM недоступен или ошибка списка статей" }, { status: 502 });
  }
  return NextResponse.json((await res.json()) as { items: unknown[] });
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const v = await verifyAdminBearerToken(token);
  if (!v.ok) {
    return NextResponse.json(
      {
        detail: "Unauthorized",
        reason: v.reason,
        ...(v.detail ? { hint: v.detail } : {}),
      },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const res = await fetch(`${getCrmServerBaseUrl()}/articles`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    detail?: string;
    item?: { slug?: string };
  };

  if (!res.ok) {
    return NextResponse.json(
      { detail: typeof data.detail === "string" ? data.detail : "Ошибка создания" },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  revalidateBlogPaths();
  if (typeof data.item?.slug === "string") {
    revalidateArticlePaths(data.item.slug);
  }

  return NextResponse.json(data, { status: 201 });
}
