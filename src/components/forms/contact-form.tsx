"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-[var(--v3-radius-input)] border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] px-4 py-3 text-[var(--v3-text-primary)] outline-none transition-colors placeholder:text-[var(--v3-text-muted)] focus-visible:border-[var(--v3-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--v3-focus-ring)]/20";

export function ContactForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    setMessage("The form is valid. Your message has not been sent.");
  }

  return (
    <Card className="contact-form-card">
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold" htmlFor="contact-name">
              Name
            </label>
            <input
              autoComplete="name"
              className={fieldClassName}
              id="contact-name"
              name="name"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="contact-email">
              Email
            </label>
            <input
              autoComplete="email"
              className={fieldClassName}
              id="contact-email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="contact-subject">
              Subject
            </label>
            <input
              className={fieldClassName}
              id="contact-subject"
              name="subject"
              placeholder="How can we help?"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="contact-message">
              Message
            </label>
            <textarea
              className={`${fieldClassName} min-h-36 resize-y`}
              id="contact-message"
              name="message"
              placeholder="Tell us a little more..."
              required
              rows={5}
            />
          </div>
          <Button className="w-full sm:w-fit" type="submit">
            Validate Message
            <Check aria-hidden="true" size={16} />
          </Button>
          <p aria-live="polite" className="m-0 text-sm text-[var(--v3-text-secondary)]">
            {message}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
