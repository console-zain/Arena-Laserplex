"use client";

import { Clapperboard, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Events", href: "/event" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

function isActiveLink(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navigationRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements =
          navigationRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled)',
          );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (
          event.shiftKey &&
          firstElement &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement?.focus();
        } else if (
          !event.shiftKey &&
          lastElement &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header
      className={`site-header site-header-floating${isHome ? " site-header-over-hero" : ""}`}
    >
      <div className="navbar-inner">
        <Link aria-label="Arena Laserplex home" className="brand-name" href="/">
          <span aria-hidden="true" className="brand-emblem">
            <Clapperboard size={20} strokeWidth={2.2} />
          </span>
          <span className="brand-wordmark">Arena Laserplex</span>
        </Link>

        <nav aria-label="Main navigation" className="desktop-navigation">
          {navigationLinks.map((link) => (
            <Link
              aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
              className="nav-link"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <ThemeToggle />
          <Link
            aria-label="Account"
            className="account-link"
            href="/my-account"
            title="Account"
          >
            <UserRound aria-hidden="true" className="account-icon" size={19} />
          </Link>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            ref={menuButtonRef}
            type="button"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" size={21} />
            ) : (
              <Menu aria-hidden="true" size={21} />
            )}
          </button>
        </div>
      </div>

      <div
        aria-hidden={!isMenuOpen}
        className={`mobile-menu-layer${isMenuOpen ? " is-open" : ""}`}
        id="mobile-navigation"
        inert={!isMenuOpen}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
      >
        <button
          aria-label="Close navigation menu"
          className="mobile-menu-backdrop"
          onClick={() => {
            setIsMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
          tabIndex={isMenuOpen ? 0 : -1}
          type="button"
        />
        <nav
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
          className="mobile-navigation"
          ref={navigationRef}
        >
          <div className="mobile-navigation-header">
            <span className="mobile-navigation-brand">Arena Laserplex</span>
            <button
              aria-label="Close navigation menu"
              className="mobile-navigation-close"
              onClick={() => {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              type="button"
            >
              <X aria-hidden="true" size={21} />
            </button>
          </div>
          {navigationLinks.map((link) => (
            <Link
              aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
              className="mobile-nav-link"
              href={link.href}
              key={link.href}
              onClick={() => setIsMenuOpen(false)}
              tabIndex={isMenuOpen ? undefined : -1}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-nav-link mobile-account-link"
            href="/my-account"
            onClick={() => setIsMenuOpen(false)}
            tabIndex={isMenuOpen ? undefined : -1}
          >
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
