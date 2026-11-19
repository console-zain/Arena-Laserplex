import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { siteConfig } from "@/config/site";

const footerGroups = [
  {
    label: "Explore",
    links: [
      { label: "Movies", href: "/movies" },
      { label: "Events", href: "/event" },
      { label: "News", href: "/news" },
    ],
  },
  {
    label: "Venue",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help-center" },
    ],
  },
  {
    label: "Account",
    links: [{ label: "My account", href: "/my-account" }],
  },
  {
    label: "Policies",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie policy", href: "/cookie-policy" },
      { label: "Cancellation policy", href: "/cancellation-policy" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Accessibility", href: "/accessibility-statement" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Security policy", href: "/security-policy" },
      { label: "Responsible disclosure", href: "/responsible-disclosure" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link aria-label={`${siteConfig.name} home`} className="footer-brand" href="/">
              <span aria-hidden="true" className="brand-emblem">
                <Clapperboard size={22} strokeWidth={2.2} />
              </span>
              <span className="brand-wordmark">{siteConfig.name}</span>
            </Link>
          </div>
          <nav aria-label="Footer navigation" className="footer-groups">
            {footerGroups.map((group) => (
              <div className="footer-group" key={group.label}>
                <h2>{group.label}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
