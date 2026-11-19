import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { SectionTitle } from "@/components/common/section-title";
import { NewsCard } from "@/components/news/news-card";
import type { NewsArticle } from "@/types/news";

interface NewsListProps {
  articles: readonly NewsArticle[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function NewsList({
  articles,
  title = "Latest updates",
  subtitle = "Published announcements and news from Arena Laserplex.",
  className,
}: NewsListProps) {
  return (
    <section
      aria-labelledby="news-list-title"
      className={`py-12 sm:py-16 ${className ?? ""}`.trim()}
    >
      <Container>
        <SectionTitle
          className="mb-8"
          subtitle={subtitle}
          title={title}
          titleId="news-list-title"
        />
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <NewsCard article={article} key={article.slug} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="m-0 text-[var(--v3-text-secondary)]">
                There are no published updates to show right now.
              </p>
            </CardContent>
          </Card>
        )}
      </Container>
    </section>
  );
}
