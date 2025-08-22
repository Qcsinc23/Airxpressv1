import { ConvexHttpClient } from "convex/browser";
import { ConvexReactClient } from "convex/react";

let convexInstance: ConvexReactClient | null = null;

export function getConvexClient() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  }
  return new ConvexHttpClient(convexUrl);
}

// Lazy-loaded client instance for use in client components
export function getConvex() {
  if (!convexInstance) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
    }
    convexInstance = new ConvexReactClient(convexUrl);
  }
  return convexInstance;
}
