import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/common/card";
import { formatDate } from "@/lib/date-utils";
import type { NewsArticle } from "@/types/news";

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export function NewsCard({ article, featured = false }: NewsCardProps) {
  const TitleTag = featured ? "h2" : "h3";
  const hasImage = Boolean(article.imageUrl);

  return (
    <Card
      className={`cinema-content-card h-full${featured ? " cinema-content-card-featured" : ""}`}
    >
      <article
        className={
          featured && hasImage
            ? "grid h-full md:grid-cols-[1.15fr_0.85fr]"
            : "flex h-full flex-col"
        }
      >
        {hasImage ? (
          <Link
            aria-label={`Read ${article.title}`}
            className={`group relative block aspect-[16/10] overflow-hidden bg-[var(--v3-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--v3-focus-ring)] ${
              featured ? "md:aspect-auto md:min-h-[25rem]" : ""
            }`}
            href={`/news/${article.slug}`}
          >
            <Image
              alt={article.imageAlt}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              fill
              sizes={
                featured
                  ? "(max-width: 767px) 100vw, 60vw"
                  : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              }
              src={article.imageUrl}
            />
          </Link>
        ) : null}

        <CardContent className="flex h-full flex-col">
          <p className="mb-3 mt-0 text-sm text-[var(--v3-text-muted)]">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </p>
          <p className="mb-2 mt-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--v3-accent-primary)]">
            {article.category}
          </p>
          <TitleTag className="mb-3 mt-0 font-[var(--font-heading)] text-xl font-semibold leading-snug sm:text-2xl">
            <Link
              className="rounded-sm hover:text-[var(--v3-accent-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
              href={`/news/${article.slug}`}
            >
              {article.title}
            </Link>
          </TitleTag>
          <p className="mb-5 mt-0 text-sm leading-6 text-[var(--v3-text-secondary)]">
            {article.excerpt}
          </p>
          <Link
            className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-sm font-semibold text-[var(--v3-text-primary)] underline-offset-4 hover:text-[var(--v3-accent-primary)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
            href={`/news/${article.slug}`}
          >
            Read update
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </CardContent>
      </article>
    </Card>
  );
}
