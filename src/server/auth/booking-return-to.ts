const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const BOOKING_SELECTION_PATH = new RegExp(
  `^/booking/(${UUID_PATTERN})\\?resume=(${UUID_PATTERN})$`,
  "i",
);
const BOOKING_SUMMARY_PATH = new RegExp(
  `^/booking/(${UUID_PATTERN})/summary\\?bookingId=(${UUID_PATTERN})$`,
  "i",
);
const BOOKING_CONFIRMATION_PATH = new RegExp(
  `^/booking/confirmation/(${UUID_PATTERN})$`,
  "i",
);

export function createBookingReturnPath(showtimeId: string, intentId: string) {
  return `/booking/${showtimeId}?resume=${intentId}`;
}

export function createBookingSummaryReturnPath(
  showtimeId: string,
  bookingId: string,
) {
  return `/booking/${showtimeId}/summary?bookingId=${bookingId}`;
}

export function createBookingConfirmationReturnPath(bookingId: string) {
  return `/booking/confirmation/${bookingId}`;
}

export function getSafeBookingReturnTo(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const selectionMatch = BOOKING_SELECTION_PATH.exec(value);
  if (selectionMatch) {
    return createBookingReturnPath(selectionMatch[1], selectionMatch[2]);
  }

  const summaryMatch = BOOKING_SUMMARY_PATH.exec(value);
  if (summaryMatch) {
    return createBookingSummaryReturnPath(summaryMatch[1], summaryMatch[2]);
  }

  const confirmationMatch = BOOKING_CONFIRMATION_PATH.exec(value);
  return confirmationMatch
    ? createBookingConfirmationReturnPath(confirmationMatch[1])
    : null;
}
