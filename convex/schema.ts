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
import documents from "./schemas/documents";
import onboarding from "./schemas/onboarding";
import store from "./schemas/store";
import { agentsSchema } from "./schemas/agents";
import { slaSchema } from "./schemas/sla";

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
  ...documents.tables,
  ...onboarding.tables,
  ...store.tables,
  ...agentsSchema,
  ...slaSchema,
};

export default defineSchema(mergedSchema);
