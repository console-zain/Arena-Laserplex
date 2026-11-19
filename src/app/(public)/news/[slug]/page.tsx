import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/button";
import { Container } from "@/components/common/container";
import { NewsList } from "@/components/news/news-list";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/date-utils";
import { toNewsArticle } from "@/lib/public-content";
import { findNewsBySlug, listPublishedNews } from "@/server/services/news";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await findNewsBySlug(slug);

  if (!record) {
    return { title: "Article Not Found" };
  }

  const article = toNewsArticle(record);

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} | ${siteConfig.name}`,
      description: article.excerpt,
      type: "article",
      publishedTime: new Date(`${article.publishedAt}T00:00:00Z`).toISOString(),
      ...(article.imageUrl
        ? { images: [{ url: article.imageUrl, alt: article.imageAlt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${siteConfig.name}`,
      description: article.excerpt,
      ...(article.imageUrl ? { images: [article.imageUrl] } : {}),
    },
  };
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const [record, relatedRecords] = await Promise.all([
    findNewsBySlug(slug),
    listPublishedNews(),
  ]);

  if (!record) {
    notFound();
  }

  const article = toNewsArticle(record);
  const relatedArticles = relatedRecords
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3)
    .map(toNewsArticle);

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--v3-text-muted)]">
          <ol className="m-0 flex flex-wrap items-center gap-2 p-0">
            <li>
              <Link className="hover:text-[var(--v3-accent-primary)]" href="/">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                className="hover:text-[var(--v3-accent-primary)]"
                href="/news"
              >
                News
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate text-[var(--v3-text-secondary)]">
              {article.title}
            </li>
          </ol>
        </nav>
      </Container>

      {article.imageUrl ? (
        <section aria-label="Update image" className="pt-6 sm:pt-8">
          <Container>
            <div className="news-detail-image relative aspect-[16/9] overflow-hidden rounded-[var(--v3-radius-feature)] bg-[var(--v3-surface-elevated)] shadow-[var(--v3-shadow-large)]">
              <Image
                alt={article.imageAlt}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 1280px"
                src={article.imageUrl}
              />
            </div>
          </Container>
        </section>
      ) : null}

      <article aria-labelledby="article-title" className="py-8 sm:py-12">
        <Container>
          <div className="news-detail-copy mx-auto max-w-3xl">
            <p className="mb-3 mt-0 text-sm text-[var(--v3-text-muted)]">
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </p>
            <p className="mb-3 mt-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
              {article.category}
            </p>
            <h1
              className="m-0 font-[var(--font-heading)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
              id="article-title"
            >
              {article.title}
            </h1>
            <p className="mb-0 mt-5 text-lg leading-7 text-[var(--v3-text-secondary)]">
              {article.excerpt}
            </p>
            <div className="mt-8 space-y-5 text-base leading-8 text-[var(--v3-text-secondary)]">
              {article.content.map((paragraph, index) => (
                <p className="m-0" key={`${article.slug}-paragraph-${index}`}>
                  {paragraph}
                </p>
              ))}
            </div>
            <Button asChild className="mt-8" variant="outline">
              <Link href="/news">
                <ArrowLeft aria-hidden="true" size={16} />
                Back to updates
              </Link>
            </Button>
          </div>
        </Container>
      </article>

      {relatedArticles.length > 0 ? (
        <NewsList
          className="border-t border-[var(--v3-border)] bg-[var(--v3-surface)]"
          articles={relatedArticles}
          subtitle="Other published news from the cinema."
          title="More updates"
        />
      ) : null}
    </main>
  );
}
