"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <button
      aria-label={
        isMounted
          ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
          : "Toggle color theme"
      }
      aria-pressed={isMounted && resolvedTheme === "dark"}
      className="theme-toggle-button"
      disabled={!isMounted}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title={isMounted ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode` : undefined}
      type="button"
    >
      {isMounted && resolvedTheme === "dark" ? (
        <Sun aria-hidden="true" size={19} />
      ) : (
        <Moon aria-hidden="true" size={19} />
      )}
    </button>
  );
}
