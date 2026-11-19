import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <a className="skip-link public-skip-link" href="#public-main-content">
        Skip to main content
      </a>
      <Navbar />
      <div id="public-main-content" tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
