// middleware.ts (root level)
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/quote", 
    "/lanes/:path*", 
    "/locations/:path*", 
    "/tracking/:path*", 
    "/docs/:path*", 
    "/api/health",
    "/api/quote",
    "/api/tracking/:path*",
    "/api/packaging"
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
