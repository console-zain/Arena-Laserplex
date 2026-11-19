import type { Metadata } from "next";
import { Card, CardContent } from "@/components/common/card";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { NewsCard } from "@/components/news/news-card";
import { NewsList } from "@/components/news/news-list";
import { siteConfig } from "@/config/site";
import { toNewsArticle } from "@/lib/public-content";
import { listPublishedNews } from "@/server/services/news";

export const metadata: Metadata = {
  title: "News",
  description:
    "Browse published movie announcements and updates from Arena Laserplex.",
  openGraph: {
    title: `News | ${siteConfig.name}`,
    description: "Published announcements and updates from Arena Laserplex.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const records = await listPublishedNews();
  const articles = records.map(toNewsArticle);
  const featuredArticle =
    articles.find((article) => article.featured) ?? articles[0];
  const otherArticles = articles.filter(
    (article) => article.slug !== featuredArticle?.slug,
  );

  return (
    <main className="!m-0 !w-full !max-w-none !p-0">
      <Container className="pt-8 sm:pt-12">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
          description="Published announcements and updates from Arena Laserplex."
          title="Cinema updates"
        />
      </Container>

      {featuredArticle ? (
        <section aria-label="Latest update" className="py-8 sm:py-12">
          <Container>
            <NewsCard article={featuredArticle} featured />
          </Container>
        </section>
      ) : (
        <section aria-label="News" className="py-8 sm:py-12">
          <Container>
            <Card>
              <CardContent>
                <p className="m-0 text-[var(--v3-text-secondary)]">
                  There are no published updates to show right now.
                </p>
              </CardContent>
            </Card>
          </Container>
        </section>
      )}

      {otherArticles.length > 0 ? (
        <NewsList
          className="border-t border-[var(--v3-border)] bg-[var(--v3-surface)]"
          articles={otherArticles}
          subtitle="More published news from the cinema."
          title="More updates"
        />
      ) : null}
    </main>
  );
}
