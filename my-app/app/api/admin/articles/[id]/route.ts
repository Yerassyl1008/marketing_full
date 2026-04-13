import { NextResponse } from "next/server";

import { revalidateArticlePaths, revalidateBlogPaths } from "@/lib/articles/revalidate-blog";
import { getCrmServerBaseUrl } from "@/lib/crm-server";
import { getBearerToken, verifyAdminBearerToken } from "@/lib/verify-admin-bearer";

export const dynamic = "force-dynamic";

async function auth(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  const v = await verifyAdminBearerToken(token);
  return v.ok ? token : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await auth(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const res = await fetch(`${getCrmServerBaseUrl()}/articles/${encodeURIComponent(id)}`, {
    method: "PATCH",
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
    oldSlug?: string;
  };

  if (!res.ok) {
    return NextResponse.json(
      { detail: typeof data.detail === "string" ? data.detail : "Ошибка сохранения" },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  revalidateBlogPaths();
  if (typeof data.oldSlug === "string") {
    revalidateArticlePaths(data.oldSlug);
  }
  if (typeof data.item?.slug === "string") {
    revalidateArticlePaths(data.item.slug);
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await auth(request);
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const res = await fetch(`${getCrmServerBaseUrl()}/articles/${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json().catch(() => ({}))) as { detail?: string; slug?: string };

  if (!res.ok) {
    return NextResponse.json(
      { detail: typeof data.detail === "string" ? data.detail : "Не удалось удалить" },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
    );
  }

  revalidateBlogPaths();
  if (typeof data.slug === "string") {
    revalidateArticlePaths(data.slug);
  }
  return NextResponse.json({ ok: true });
}
