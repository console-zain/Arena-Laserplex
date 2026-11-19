import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  className,
}: PageHeaderProps) {
  return (
    <header className={twMerge(clsx("page-header", className))}>
      {breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="page-header-breadcrumbs">
          <ol>
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1;

              return (
                <li key={`${item.label}-${index}`}>
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="page-header-breadcrumb-icon"
                      size={15}
                    />
                  ) : null}
                  {item.href && !isCurrent ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <span aria-current={isCurrent ? "page" : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
      <h1 className="page-header-title">{title}</h1>
      {description ? (
        <p className="page-header-description">{description}</p>
      ) : null}
    </header>
  );
}
