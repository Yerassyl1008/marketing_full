import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import Header from "@/app/components/headaer/header";
import Footer from "@/app/components/footer/footer";
import { TeamSurfaceHeaderSection } from "@/app/components/layout/team-surface-header";
import { resolveArticleForLocale } from "@/lib/articles/resolve-display";
import { getArticleBySlug } from "@/lib/articles/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, true);
  if (!article) {
    notFound();
  }

  const view = await resolveArticleForLocale(article, locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const paragraphs = view.body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <main className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-8 px-3 sm:gap-10 sm:px-4 md:px-6 lg:max-w-[1400px]">
        <TeamSurfaceHeaderSection className="mt-6">
          <Header />
          <article className="mx-auto min-w-0 w-full max-w-3xl pb-10">
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--design-btn)] hover:underline"
            >
              ← {t("back")}
            </Link>
            <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-[var(--foreground)] [overflow-wrap:anywhere] sm:text-4xl">
              {view.title}
            </h1>
            {view.excerpt ? (
              <p className="mt-3 break-words text-lg text-[var(--design-muted)] [overflow-wrap:anywhere]">
                {view.excerpt}
              </p>
            ) : null}
            <div className="prose prose-zinc mt-8 min-w-0 max-w-none dark:prose-invert">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mb-4 whitespace-pre-wrap break-words text-[var(--design-text)] [overflow-wrap:anywhere] last:mb-0"
                >
                  {p}
                </p>
              ))}
            </div>
          </article>
        </TeamSurfaceHeaderSection>
      </main>
      <Footer />
    </>
  );
}
