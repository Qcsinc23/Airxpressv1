// convex/schema.ts
import { defineSchema } from "convex/server";

// Individual schemas
import users from "./schemas/users";
import companies from "./schemas/companies";
import lanes from "./schemas/lanes";
import quotes from "./schemas/quotes";
import bookings from "./schemas/bookings";
import content from "./schemas/content";
import audit from "./schemas/audit";
import flags from "./schemas/flags";

// Merge all schemas
const mergedSchema = {
  ...users.tables,
  ...companies.tables,
  ...lanes.tables,
  ...quotes.tables,
  ...bookings.tables,
  ...content.tables,
  ...audit.tables,
  ...flags.tables,
};

export default defineSchema(mergedSchema);
