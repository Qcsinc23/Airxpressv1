// app/auth/clerk-provider.tsx
'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProvider } from 'convex/react';
import { ReactNode } from 'react';
import { getConvex } from '../lib/convex/client';

export function Providers({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    // During build time or when key is missing, render children without Clerk
    return (
      <div>
        {children}
      </div>
    );
  }

  const convexClient = getConvex();
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {convexClient ? (
        <ConvexProvider client={convexClient}>
          {children}
        </ConvexProvider>
      ) : (
        <div>
          {children}
        </div>
      )}
    </ClerkProvider>
  );
}
