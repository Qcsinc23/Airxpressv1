// app/lib/convex/client.ts
// Client-side Convex integration for AirXpress

import { api } from '../../../convex/_generated/api';
import type { DataModel } from '../../../convex/_generated/server';

// Mock Convex client for development
export const convexClient = {
  // Query functions
  query: (queryFunction: any, args?: any) => {
    console.warn('Convex queries are not available in development mode. Use API routes instead.');
    return Promise.resolve(null);
  },

  // Mutation functions
  mutation: (mutationFunction: any, args?: any) => {
    console.warn('Convex mutations are not available in development mode. Use API routes instead.');
    return Promise.resolve(null);
  },

  // Action functions
  action: (actionFunction: any, args?: any) => {
    console.warn('Convex actions are not available in development mode. Use API routes instead.');
    return Promise.resolve(null);
  }
};

// Hook for using Convex in React components
export const useConvexQuery = (queryFunction: any, args?: any) => {
  console.warn('useConvexQuery is not available in development mode. Use API routes with SWR or React Query instead.');
  return null;
};

export const useConvexMutation = (mutationFunction: any) => {
  console.warn('useConvexMutation is not available in development mode. Use API routes instead.');
  return () => Promise.resolve(null);
};

// Re-export the API for consistency with Convex patterns
export { api };

// Type exports for use in other files
export type { DataModel };