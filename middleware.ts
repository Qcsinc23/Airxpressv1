// middleware.ts (root level)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", 
  "/quote", 
  "/lanes/(.*)", 
  "/locations/(.*)", 
  "/tracking(.*)", 
  "/docs(.*)", 
  "/api/health",
  "/api/quote",
  "/api/tracking(.*)",
  "/api/packaging"
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
