import { revalidatePath } from "next/cache";

import { routing } from "@/i18n/routing";

export function revalidateBlogPaths(): void {
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(`${prefix}/blog`);
  }
}

export function revalidateArticlePaths(slug: string): void {
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(`${prefix}/blog/${slug}`);
  }
}
