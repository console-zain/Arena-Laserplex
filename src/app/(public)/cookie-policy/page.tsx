import { LegalPage, createLegalMetadata } from "@/components/legal/legal-page";
import type { LegalSection } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

const description = `How ${siteConfig.name} uses cookies and browser storage.`;

export const metadata = createLegalMetadata("Cookie Policy", description);

const sections: readonly LegalSection[] = [
  {
    title: "Essential session cookies",
    paragraphs: [
      "When you sign in, the authentication service uses a session cookie to keep your account signed in and protect account-only pages. If you block or delete essential cookies, sign-in and booking-history features may not work.",
    ],
  },
  {
    title: "Theme preference",
    paragraphs: [
      "The dark/light theme selector stores your chosen theme in browser local storage. This is browser storage, not a cookie, and it is used only to remember the display preference.",
    ],
  },
  {
    title: "Third-party media",
    paragraphs: [
      "Movie details may be provided by The Movie Database (TMDB). Movie trailers use YouTube's privacy-enhanced embed domain when available. Third-party services may receive technical request information when their content is requested or played and apply their own policies.",
    ],
  },
  {
    title: "Your controls",
    paragraphs: [
      "You can clear or restrict cookies and local storage through your browser settings. No optional advertising or analytics cookie preference controls are currently provided on this website.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      description={description}
      sections={sections}
      title="Cookie Policy"
    />
  );
}
