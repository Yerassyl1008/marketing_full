import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import Header from "@/app/components/headaer/header";
import Footer from "@/app/components/footer/footer";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";
import { resolveArticleForLocale } from "@/lib/articles/resolve-display";
import { readArticles } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const raw = (await readArticles())
    .filter((a) => a.published)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const list = await Promise.all(
    raw.map(async (article) => ({
      article,
      view: await resolveArticleForLocale(article, locale),
    })),
  );

  return (
    <>
      <main className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-8 px-3 sm:gap-10 sm:px-4 md:px-6 lg:max-w-[1400px]">
        <TeamSurfaceHeaderSection className="mt-6">
          <Header />
          <div className="pb-6">
            <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-[var(--design-muted)]">{t("subtitle")}</p>

            {list.length === 0 ? (
              <p className="mt-10 text-[var(--design-muted)]">{t("empty")}</p>
            ) : (
              <ul className="mt-8 flex flex-col gap-4">
                {list.map(({ article, view }) => (
                  <li key={article.id}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="block min-w-0 rounded-2xl border border-[color:var(--foreground)]/10 bg-[var(--header-bg)] p-5 transition hover:border-[var(--design-btn)]/40 dark:border-white/10"
                    >
                      <h2 className="break-words text-xl font-semibold text-[var(--foreground)] [overflow-wrap:anywhere]">
                        {view.title}
                      </h2>
                      {view.excerpt ? (
                        <p className="mt-2 line-clamp-2 break-words text-sm text-[var(--design-muted)] [overflow-wrap:anywhere]">
                          {view.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-3 inline-block text-sm font-medium text-[var(--design-btn)]">
                        {t("readMore")} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TeamSurfaceHeaderSection>
      </main>
      <Footer />
    </>
  );
}
