// app/lib/convex/client.ts
// Client-side Convex integration for AirXpress

'use client';

import { ConvexReactClient } from 'convex/react';

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your environment');
}

// Create the Convex client
export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Re-export for convenience
export { api } from '../../../convex/_generated/api';
export type { DataModel } from '../../../convex/_generated/dataModel';