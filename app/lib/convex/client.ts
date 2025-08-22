import { ConvexHttpClient } from "convex/browser";
import { ConvexReactClient } from "convex/react";

let convexInstance: ConvexReactClient | null = null;

// Check if we're in a browser environment to avoid build-time issues
const isBrowser = typeof window !== 'undefined';

export function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || convexUrl.trim() === '') {
    // During build time, environment variables might not be available
    // Return a mock client or throw a more specific error
    if (process.env.NODE_ENV === 'production' && !convexUrl) {
      // In production build, create a dummy client that won't be used
      // This allows the build to complete while still failing at runtime if actually called
      return new ConvexHttpClient('https://dummy-build-url.convex.cloud');
    }
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set. This is required for server-side rendering and API routes during build and runtime.");
  }
  return new ConvexHttpClient(convexUrl);
}

// Lazy-loaded client instance for use in client components
export function getConvex() {
  // Only initialize during runtime on the client, not during build
  if (!isBrowser) {
    return null;
  }
  
  if (!convexInstance) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
    }
    convexInstance = new ConvexReactClient(convexUrl);
  }
  return convexInstance;
}
