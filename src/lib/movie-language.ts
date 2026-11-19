export function movieLanguageLabel(language: string | null | undefined) {
  if (!language) {
    return "Not set";
  }

  const normalizedLanguage = language.trim().toLowerCase();
  if (!normalizedLanguage) {
    return "Not set";
  }

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(
        normalizedLanguage,
      ) ?? normalizedLanguage.toUpperCase()
    );
  } catch {
    return normalizedLanguage.toUpperCase();
  }
}

export function movieLanguageSummary(
  screeningLanguages: readonly string[],
  originalLanguage: string | null,
  limit = 3,
) {
  const isScreeningLanguage = screeningLanguages.length > 0;
  const languages = isScreeningLanguage
    ? screeningLanguages
    : originalLanguage
      ? [originalLanguage]
      : [];

  if (languages.length === 0) {
    return null;
  }

  const visibleLanguages = languages.slice(0, limit).map(movieLanguageLabel);
  const remainingCount = languages.length - visibleLanguages.length;
  const summary = visibleLanguages.join(" · ");

  return `${isScreeningLanguage ? "Screening" : "Original"}: ${summary}${
    remainingCount > 0 ? ` +${remainingCount}` : ""
  }`;
}
