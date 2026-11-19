import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";
import { Container } from "@/components/common/container";

interface PageBannerProps {
  title: string;
  titleAs?: "h1" | "h2" | "p";
  description?: string;
  backgroundImage?: string;
  eyebrow?: string;
  overlayOpacity?: number;
  children?: ReactNode;
  className?: string;
}

type BannerStyle = CSSProperties & {
  "--page-banner-overlay-opacity": number;
};

export function PageBanner({
  title,
  titleAs = "h1",
  description,
  backgroundImage,
  eyebrow,
  overlayOpacity = 0.72,
  children,
  className,
}: PageBannerProps) {
  const overlay = Number.isFinite(overlayOpacity)
    ? Math.min(1, Math.max(0, overlayOpacity))
    : 0.72;
  const style: BannerStyle = {
    "--page-banner-overlay-opacity": overlay,
  };
  const Title = titleAs;
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`page-banner${className ? ` ${className}` : ""}`}
      style={style}
    >
      {backgroundImage ? (
        <Image
          alt=""
          aria-hidden="true"
          className="page-banner-image"
          fill
          priority
          sizes="100vw"
          src={backgroundImage}
        />
      ) : null}
      <Container className="page-banner-content">
        {eyebrow ? <p className="page-banner-eyebrow">{eyebrow}</p> : null}
        <Title className="page-banner-title" id={titleId}>
          {title}
        </Title>
        {description ? (
          <p className="page-banner-description">{description}</p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
