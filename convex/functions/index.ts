// convex/functions/index.ts
import { internalMutation, mutation, query } from "./_generated/server";

// Export all functions
export { createQuote, getQuote, getQuotesByUser } from "./quotes";
export { createBooking, updateBookingStatus, getBooking, getBookingsByStatus } from "./bookings";
export { getActiveLanes, getLanesByOD } from "./lanes";
export { getContentByTypeAndSlug, getContentByType } from "./content";
