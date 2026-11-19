export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
