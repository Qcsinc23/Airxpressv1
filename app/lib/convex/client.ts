import { ConvexHttpClient } from "convex/browser";
import { ConvexReactClient } from "convex/react";

let convexInstance: ConvexReactClient | null = null;

// Check if we're in a browser environment to avoid build-time issues
const isBrowser = typeof window !== 'undefined';

export function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
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
