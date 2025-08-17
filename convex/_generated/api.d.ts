/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as bookings from "../bookings.js";
import type * as functions_bookings from "../functions/bookings.js";
import type * as functions_content from "../functions/content.js";
import type * as functions_index from "../functions/index.js";
import type * as functions_lanes from "../functions/lanes.js";
import type * as functions_quotes from "../functions/quotes.js";
import type * as functions_store from "../functions/store.js";
import type * as functions_users from "../functions/users.js";
import type * as onboarding from "../onboarding.js";
import type * as schemas_agents from "../schemas/agents.js";
import type * as schemas_audit from "../schemas/audit.js";
import type * as schemas_bookings from "../schemas/bookings.js";
import type * as schemas_companies from "../schemas/companies.js";
import type * as schemas_content from "../schemas/content.js";
import type * as schemas_documents from "../schemas/documents.js";
import type * as schemas_flags from "../schemas/flags.js";
import type * as schemas_lanes from "../schemas/lanes.js";
import type * as schemas_onboarding from "../schemas/onboarding.js";
import type * as schemas_quotes from "../schemas/quotes.js";
import type * as schemas_sla from "../schemas/sla.js";
import type * as schemas_store from "../schemas/store.js";
import type * as schemas_users from "../schemas/users.js";
import type * as sla from "../sla.js";
import type * as sla_defaults from "../sla_defaults.js";
import type * as storage from "../storage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  bookings: typeof bookings;
  "functions/bookings": typeof functions_bookings;
  "functions/content": typeof functions_content;
  "functions/index": typeof functions_index;
  "functions/lanes": typeof functions_lanes;
  "functions/quotes": typeof functions_quotes;
  "functions/store": typeof functions_store;
  "functions/users": typeof functions_users;
  onboarding: typeof onboarding;
  "schemas/agents": typeof schemas_agents;
  "schemas/audit": typeof schemas_audit;
  "schemas/bookings": typeof schemas_bookings;
  "schemas/companies": typeof schemas_companies;
  "schemas/content": typeof schemas_content;
  "schemas/documents": typeof schemas_documents;
  "schemas/flags": typeof schemas_flags;
  "schemas/lanes": typeof schemas_lanes;
  "schemas/onboarding": typeof schemas_onboarding;
  "schemas/quotes": typeof schemas_quotes;
  "schemas/sla": typeof schemas_sla;
  "schemas/store": typeof schemas_store;
  "schemas/users": typeof schemas_users;
  sla: typeof sla;
  sla_defaults: typeof sla_defaults;
  storage: typeof storage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
