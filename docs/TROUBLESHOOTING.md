# AirXpress Troubleshooting Guide

## 🔍 Overview

This guide helps diagnose and resolve common issues encountered when developing, deploying, or using the AirXpress freight management platform.

**Quick Links:**
- [Development Issues](#development-issues)
- [Build & Deployment](#build--deployment)
- [Authentication Problems](#authentication-problems)
- [Database Issues](#database-issues)
- [Payment Processing](#payment-processing)
- [API Issues](#api-issues)
- [Performance Problems](#performance-problems)

## 🛠 Development Issues

### Node.js and Dependencies

#### Issue: `npm install` fails
**Symptoms:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Use exact Node.js version
nvm use 18.17.0

# Install with legacy peer deps flag
npm install --legacy-peer-deps

# Force resolution (last resort)
npm install --force
```

#### Issue: TypeScript compilation errors
**Symptoms:**
```bash
Type 'EnhancedRate' is not assignable to type 'Rate'
Property 'breakdown' is missing in type
```

**Solutions:**
```typescript
// Check interface compatibility
interface EnhancedRate extends Omit<Rate, 'breakdown'> {
  breakdown?: {
    freight?: number;
    packaging?: number;
    surcharges?: number;
  };
}

// Use type assertions carefully
const rate = enhancedRate as Rate;

// Verify tsconfig.json settings
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true // Temporary fix
  }
}
```

#### Issue: Import/Export errors
**Symptoms:**
```bash
Module not found: Can't resolve './components/QuoteResults'
Unexpected token 'export'
```

**Solutions:**
```javascript
// Use consistent import paths
import QuoteResults from '@/components/quote/QuoteResults';

// Check next.config.js path mapping
module.exports = {
  experimental: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
}

// Verify file extensions
import Component from './Component.tsx'; // Include .tsx if needed
```

### Development Server Issues

#### Issue: Dev server won't start
**Symptoms:**
```bash
Port 3000 is already in use
Error: listen EADDRINUSE :::3000
```

**Solutions:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
npm run dev -- -p 3001

# Or set PORT environment variable
PORT=3001 npm run dev
```

#### Issue: Hot reload not working
**Symptoms:**
- Changes don't reflect in browser
- Need to manually refresh

**Solutions:**
```javascript
// Check next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable if causing issues
  experimental: {
    turbo: false
  }
}

// Clear .next directory
rm -rf .next

# Restart dev server
npm run dev
```

---

## 🏗 Build & Deployment

### Build Failures

#### Issue: Build fails with memory errors
**Symptoms:**
```bash
FATAL ERROR: Reached heap limit Allocation failed
JavaScript heap out of memory
```

**Solutions:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max_old_space_size=4096" npm run build

# Add to package.json scripts
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}

# For production deployment
export NODE_OPTIONS="--max_old_space_size=4096"
```

#### Issue: TypeScript build errors in production
**Symptoms:**
```bash
Type error: Cannot find module '@/types/pricing'
Build failed because of TypeScript errors
```

**Solutions:**
```typescript
// Create proper type declarations
// types/pricing.ts
export interface PricingPolicy {
  markups: Record<string, number>;
  surcharges: Record<string, any>;
}

// Use proper imports
import type { PricingPolicy } from '@/types/pricing';

// Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### Issue: Missing environment variables in build
**Symptoms:**
```bash
Error: Environment variable NEXT_PUBLIC_CONVEX_URL is not defined
Build process exits with code 1
```

**Solutions:**
```bash
# Check environment variable names
# Must start with NEXT_PUBLIC_ for client-side access
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Verify .env.local exists
cp .env.example .env.local

# For production deployment
# Set environment variables in deployment platform
```

### Deployment Issues

#### Issue: Vercel deployment fails
**Symptoms:**
```bash
Build failed with exit code 1
Function runtime is invalid
```

**Solutions:**
```json
// Check vercel.json configuration
{
  "functions": {
    "pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "regions": ["iad1"]
}

// Verify build command in Vercel dashboard
// Build Command: npm run build
// Output Directory: .next
// Install Command: npm install
```

#### Issue: AWS deployment container crashes
**Symptoms:**
```bash
Container exited with code 1
Health check failed
```

**Solutions:**
```dockerfile
# Dockerfile health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Check application logs
docker logs <container-id>

# Verify environment variables
docker exec -it <container-id> printenv
```

---

## 🔐 Authentication Problems

### Clerk Authentication Issues

#### Issue: Users can't sign in
**Symptoms:**
- Sign-in page shows error
- "Invalid publishable key"
- Redirect loops

**Solutions:**
```javascript
// Verify Clerk keys in .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

// Check Clerk middleware
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/quote", "/api/tracking/:path*"],
});

// Verify Clerk provider wraps app
// _app.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
```

#### Issue: Role-based access not working
**Symptoms:**
- Admin users can't access admin pages
- API returns 403 Forbidden

**Solutions:**
```javascript
// Check user roles in Clerk dashboard
// Ensure roles are assigned correctly

// Verify role checking in API routes
import { auth, clerkClient } from '@clerk/nextjs';

export default async function handler(req, res) {
  const { userId } = auth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await clerkClient.users.getUser(userId);
  const userRole = user.publicMetadata?.role;
  
  if (!['admin', 'operations'].includes(userRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Continue with protected logic
}
```

#### Issue: JWT token issues
**Symptoms:**
- "Invalid token" errors
- Token expires immediately

**Solutions:**
```javascript
// Check JWT configuration
// pages/api/auth/[...clerk].js
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }
  
  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(payload, headers) as WebhookEvent;
}
```

---

## 🗄 Database Issues

### Convex Connection Problems

#### Issue: Can't connect to Convex
**Symptoms:**
```bash
ConvexError: Request failed with status 401
Unable to connect to deployment
```

**Solutions:**
```bash
# Verify Convex URL and key
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Re-authenticate with Convex
npx convex login

# Check deployment status
npx convex dashboard

# Recreate deployment if needed
npx convex init
```

#### Issue: Schema validation errors
**Symptoms:**
```bash
ValidationError: Invalid value for field "weight"
Expected number, got string
```

**Solutions:**
```javascript
// Check schema definition
// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  quotes: defineTable({
    weight: v.number(), // Ensure correct type
    dimensions: v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    }),
  }),
});

// Validate data before sending
function validateQuoteData(data) {
  return {
    ...data,
    weight: parseFloat(data.weight), // Convert string to number
    dimensions: {
      length: parseFloat(data.dimensions.length),
      width: parseFloat(data.dimensions.width),
      height: parseFloat(data.dimensions.height),
    }
  };
}
```

#### Issue: Query performance problems
**Symptoms:**
- Slow page loads
- Timeout errors
- High database load

**Solutions:**
```javascript
// Add proper indexes
// convex/schema.js
export default defineSchema({
  quotes: defineTable({
    userId: v.string(),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_and_date", ["userId", "createdAt"]),
});

// Optimize queries
// convex/quotes.js
export const getQuotesByUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10); // Limit results
  },
});
```

---

## 💳 Payment Processing

### Stripe Integration Issues

#### Issue: Payment processing fails
**Symptoms:**
```bash
StripeError: No such payment_intent
Your card was declined
```

**Solutions:**
```javascript
// Check Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

// Use test cards for development
const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  authenticate: '4000002760003184',
};

// Handle errors properly
try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 2000,
    currency: 'usd',
    metadata: { bookingId: 'booking_123' },
  });
} catch (error) {
  console.error('Stripe error:', error.message);
  return res.status(400).json({ error: error.message });
}
```

#### Issue: Webhook signature verification fails
**Symptoms:**
```bash
Webhook signature verification failed
Invalid signature header
```

**Solutions:**
```javascript
// Check webhook endpoint secret
STRIPE_WEBHOOK_SECRET=whsec_...

// Verify signature correctly
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // Process event
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
```

---

## 🔌 API Issues

### Common API Problems

#### Issue: CORS errors
**Symptoms:**
```bash
Access-Control-Allow-Origin header is missing
CORS policy blocked the request
```

**Solutions:**
```javascript
// Add CORS headers
// pages/api/quote.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle actual request
}

// Or use CORS middleware
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  // Handle request
}
```

#### Issue: Rate limiting problems
**Symptoms:**
```bash
Too Many Requests (429)
Rate limit exceeded
```

**Solutions:**
```javascript
// Implement proper rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

// Apply to API routes
export default function handler(req, res) {
  return limiter(req, res, () => {
    // Handle request
  });
}
```

#### Issue: Validation errors
**Symptoms:**
```bash
ValidationError: "weight" must be a number
Request body validation failed
```

**Solutions:**
```javascript
// Use Zod for validation
import { z } from 'zod';

const QuoteSchema = z.object({
  origin: z.object({
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
  destination: z.object({
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}$/),
  }),
  packages: z.array(z.object({
    weight: z.number().positive(),
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  })).min(1),
});

export default function handler(req, res) {
  try {
    const validatedData = QuoteSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  }
}
```

---

## ⚡ Performance Problems

### Slow Page Loads

#### Issue: Large bundle size
**Symptoms:**
- Slow initial page load
- Large JavaScript files
- Poor Lighthouse scores

**Solutions:**
```javascript
// Analyze bundle size
npm run build
npm install -g @next/bundle-analyzer

// Enable bundle analyzer
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Your config
});

// Run analysis
ANALYZE=true npm run build

// Code splitting
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

// Tree shaking
import { debounce } from 'lodash-es'; // Instead of import _ from 'lodash'
```

#### Issue: Slow API responses
**Symptoms:**
- API calls take >2 seconds
- Timeout errors
- Poor user experience

**Solutions:**
```javascript
// Add response caching
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  
  // Your API logic
}

// Implement database query optimization
// Use proper indexes
// Limit result sets
// Use pagination

// Add loading states
function QuoteResults() {
  const [loading, setLoading] = useState(true);
  
  return (
    <>
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : (
        <ResultsComponent />
      )}
    </>
  );
}
```

### Memory Issues

#### Issue: Memory leaks in development
**Symptoms:**
- Dev server becomes slow
- Browser tabs crash
- High memory usage

**Solutions:**
```javascript
// Use React.memo for expensive components
import React from 'react';

const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Clean up useEffect subscriptions
useEffect(() => {
  const subscription = api.subscribe(callback);
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);

// Use useMemo and useCallback appropriately
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const memoizedCallback = useCallback((id) => {
  doSomething(id);
}, []);
```

---

## 🚨 Emergency Procedures

### Critical Issues

#### Application is completely down
**Immediate Actions:**
1. **Check status page/monitoring**
2. **Verify deployment platform status**
3. **Check recent deployments/changes**
4. **Roll back if necessary**

```bash
# Quick rollback on Vercel
vercel rollback

# Or redeploy previous version
git checkout <previous-commit>
vercel --prod

# Check application logs
vercel logs --follow
```

#### Database is corrupted/inaccessible
**Immediate Actions:**
1. **Check Convex dashboard**
2. **Verify network connectivity**
3. **Restore from backup if needed**

```bash
# Check Convex status
npx convex dashboard

# Restore from backup
npx convex import backup-20240812.jsonl --prod
```

#### Payment processing is failing
**Immediate Actions:**
1. **Check Stripe dashboard**
2. **Verify webhook endpoints**
3. **Switch to backup payment method**
4. **Notify users immediately**

---

## 📞 Getting Help

### Internal Resources
1. **Application logs** - Check Vercel/platform logs
2. **Error tracking** - Sentry dashboard
3. **Monitoring** - Application performance metrics
4. **Database** - Convex dashboard

### External Support
1. **Next.js Issues** - [GitHub Issues](https://github.com/vercel/next.js/issues)
2. **Vercel Support** - [Support Portal](https://vercel.com/support)
3. **Convex Support** - [Discord](https://discord.gg/convex)
4. **Stripe Support** - [Support Center](https://support.stripe.com/)

### Emergency Contacts
- **Technical Lead**: tech-lead@airxpress.com
- **DevOps**: devops@airxpress.com  
- **On-call**: +1-555-EMERGENCY

---

## 📚 Additional Resources

### Documentation
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [Vercel Troubleshooting](https://vercel.com/docs/concepts/deployments/troubleshoot-a-build)
- [Convex Troubleshooting](https://docs.convex.dev/troubleshooting)

### Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Next.js DevTools](https://www.npmjs.com/package/@next/env)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Vercel Community](https://vercel.com/community)
- [React Community](https://reactjs.org/community/support.html)

---

**Last Updated**: August 12, 2024  
**Version**: 1.0  
**Contributing**: Found a solution not listed here? Please contribute to this guide!