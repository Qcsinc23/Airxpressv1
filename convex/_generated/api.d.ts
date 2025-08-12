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
import type * as functions_bookings from "../functions/bookings.js";
import type * as functions_content from "../functions/content.js";
import type * as functions_index from "../functions/index.js";
import type * as functions_lanes from "../functions/lanes.js";
import type * as functions_quotes from "../functions/quotes.js";
import type * as schemas_audit from "../schemas/audit.js";
import type * as schemas_bookings from "../schemas/bookings.js";
import type * as schemas_companies from "../schemas/companies.js";
import type * as schemas_content from "../schemas/content.js";
import type * as schemas_flags from "../schemas/flags.js";
import type * as schemas_lanes from "../schemas/lanes.js";
import type * as schemas_quotes from "../schemas/quotes.js";
import type * as schemas_users from "../schemas/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/bookings": typeof functions_bookings;
  "functions/content": typeof functions_content;
  "functions/index": typeof functions_index;
  "functions/lanes": typeof functions_lanes;
  "functions/quotes": typeof functions_quotes;
  "schemas/audit": typeof schemas_audit;
  "schemas/bookings": typeof schemas_bookings;
  "schemas/companies": typeof schemas_companies;
  "schemas/content": typeof schemas_content;
  "schemas/flags": typeof schemas_flags;
  "schemas/lanes": typeof schemas_lanes;
  "schemas/quotes": typeof schemas_quotes;
  "schemas/users": typeof schemas_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
