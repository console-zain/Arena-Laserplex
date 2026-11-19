import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
}

export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  align = "left",
  className,
  titleId,
}: SectionTitleProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "section-title",
          align === "center" && "section-title-centered",
          className,
        ),
      )}
    >
      {eyebrow ? <p className="section-title-eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title-heading" id={titleId}>
        {title}
      </h2>
      {subtitle ? <p className="section-title-subtitle">{subtitle}</p> : null}
    </div>
  );
}
