# AirXpress Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying AirXpress to production environments. The application is designed for containerized deployment with support for multiple platforms.

**Recommended Stack:**
- **Frontend/Backend**: Vercel (Next.js optimized)
- **Database**: Convex (managed service)
- **Authentication**: Clerk (managed service)
- **Payments**: Stripe (managed service)
- **File Storage**: AWS S3

## 📋 Pre-Deployment Checklist

### Required Services Setup

1. **Convex Account**
   ```bash
   # Sign up at https://convex.dev
   # Create new project
   # Note deployment URL and deploy key
   ```

2. **Clerk Account**
   ```bash
   # Sign up at https://clerk.com
   # Create application
   # Configure sign-in methods
   # Note publishable and secret keys
   ```

3. **Stripe Account**
   ```bash
   # Sign up at https://stripe.com
   # Complete account verification
   # Note publishable and secret keys
   # Configure webhooks
   ```

4. **AWS Account**
   ```bash
   # Create S3 bucket for document storage
   # Create IAM user with S3 permissions
   # Note access key and secret
   ```

### Environment Variables

Create production environment variables file:

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-deploy-key

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=airxpress-prod-documents

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-32-char-secret

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
SENTRY_DSN=https://...
```

---

## 🔧 Platform-Specific Deployments

### Vercel (Recommended)

Vercel provides optimal Next.js 15 support with zero configuration.

#### 1. Prerequisites
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### 2. Deploy from GitHub
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub: `https://github.com/Qcsinc23/Airxpressv1`

2. **Configure Build Settings**
   ```bash
   # Build Command (auto-detected)
   npm run build
   
   # Output Directory (auto-detected)  
   .next
   
   # Install Command (auto-detected)
   npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all production environment variables
   - Ensure "Production" environment is selected

4. **Deploy**
   - Vercel will automatically deploy on every push to `main`
   - First deployment may take 3-5 minutes

#### 3. Custom Domain Setup
```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS (at your domain registrar)
# CNAME: your-domain.com -> cname.vercel-dns.com
```

#### 4. Performance Optimizations
```javascript
// vercel.json (optional optimizations)
{
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

---

### Railway

Railway offers full-stack deployment with databases and services.

#### 1. Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link
```

#### 2. Deploy
```bash
# Deploy from local directory
railway up

# Or connect GitHub repository
# Go to Railway dashboard and connect repository
```

#### 3. Configuration
```bash
# Add environment variables via dashboard
# Railway automatically detects Next.js projects
# Build command: npm run build
# Start command: npm start
```

---

### AWS (Advanced)

Full control deployment using AWS services.

#### 1. Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │  ALB + ECS      │    │   RDS/Convex    │
│   (CDN/Static)  │────│  (App Servers)  │────│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 2. Infrastructure as Code (Terraform)
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "airxpress" {
  name = "airxpress-prod"
}

# Application Load Balancer
resource "aws_lb" "airxpress" {
  name               = "airxpress-alb"
  internal           = false
  load_balancer_type = "application"
  subnets           = [aws_subnet.public_1.id, aws_subnet.public_2.id]
}

# ECS Task Definition
resource "aws_ecs_task_definition" "airxpress" {
  family                   = "airxpress"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = 512
  memory                  = 1024
  
  container_definitions = jsonencode([
    {
      name  = "airxpress"
      image = "your-account.dkr.ecr.us-east-1.amazonaws.com/airxpress:latest"
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        # Add other environment variables
      ]
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}
```

#### 3. Docker Setup
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### 4. Build and Push
```bash
# Build Docker image
docker build -t airxpress:latest .

# Tag for ECR
docker tag airxpress:latest your-account.dkr.ecr.us-east-1.amazonaws.com/airxpress:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/airxpress:latest
```

---

### Digital Ocean

Simple, cost-effective deployment option.

#### 1. App Platform Deployment
```yaml
# .do/app.yaml
name: airxpress
services:
- name: web
  source_dir: /
  github:
    repo: Qcsinc23/Airxpressv1
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_CONVEX_URL
    value: ${CONVEX_URL}
  # Add other environment variables
```

#### 2. Deploy via CLI
```bash
# Install doctl
snap install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create .do/app.yaml

# Or deploy via web interface
```

---

## 🗄️ Database Deployment

### Convex Production Setup

1. **Create Production Deployment**
   ```bash
   # Login to Convex
   npx convex login
   
   # Create production deployment
   npx convex deploy --prod
   
   # Push schema and functions
   npx convex deploy --prod
   ```

2. **Configure Environment Variables**
   ```bash
   # Production Convex URL
   NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
   CONVEX_DEPLOY_KEY=prod:your-deploy-key
   ```

3. **Data Migration** (if applicable)
   ```bash
   # Export development data
   npx convex export --dev data.jsonl
   
   # Import to production
   npx convex import --prod data.jsonl
   ```

---

## 💳 Payment System Setup

### Stripe Production Configuration

1. **Activate Stripe Account**
   - Complete business verification
   - Add bank account for payouts
   - Configure tax settings

2. **Webhook Configuration**
   ```bash
   # Production webhook endpoint
   https://your-domain.com/api/webhook/stripe
   
   # Events to listen for:
   payment_intent.succeeded
   payment_intent.payment_failed
   invoice.payment_succeeded
   customer.subscription.updated
   ```

3. **Test Payment Flow**
   ```bash
   # Use test cards in production mode
   # Success: 4242424242424242
   # Decline: 4000000000000002
   ```

---

## 🔐 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt (Free)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### CloudFlare (Recommended)
1. Add domain to CloudFlare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Configure firewall rules

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ]
  }
}
```

---

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)

1. **Setup Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure**
   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   ```

3. **Environment Variables**
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

### Performance Monitoring

#### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to _app.js
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

#### Google Analytics
```javascript
// lib/gtag.js
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deploy Scripts

```json
// package.json
{
  "scripts": {
    "deploy:staging": "vercel",
    "deploy:production": "vercel --prod",
    "deploy:convex": "npx convex deploy --prod"
  }
}
```

---

## 🧪 Production Testing

### Health Checks

```javascript
// pages/api/health.js
export default function handler(req, res) {
  // Check database connectivity
  // Check external services
  // Return status
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      stripe: 'connected',
      clerk: 'connected'
    }
  });
}
```

### Smoke Tests

```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://your-domain.com"

# Test homepage
curl -f "$BASE_URL" > /dev/null || exit 1

# Test API health
curl -f "$BASE_URL/api/health" > /dev/null || exit 1

# Test quote endpoint
curl -f -X POST "$BASE_URL/api/quote" \
  -H "Content-Type: application/json" \
  -d '{"origin":{"city":"New York","state":"NY","zipCode":"10001"},"destination":{"city":"Los Angeles","state":"CA","zipCode":"90210"},"packages":[{"weight":25,"length":24,"width":18,"height":12}]}' \
  > /dev/null || exit 1

echo "All smoke tests passed!"
```

---

## 📈 Scaling Considerations

### Performance Optimization

1. **CDN Configuration**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-domain.com'],
       loader: 'cloudinary', // or 'imgix'
     },
     
     experimental: {
       optimizeCss: true,
       optimizeImages: true,
     }
   }
   ```

2. **Caching Strategy**
   ```javascript
   // API routes caching
   export default function handler(req, res) {
     res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
     // Handle request
   }
   ```

3. **Database Optimization**
   ```javascript
   // Convex indexes for performance
   // In convex/schema.js
   export default defineSchema({
     quotes: defineTable({
       userId: v.string(),
       createdAt: v.number(),
       // other fields
     }).index("by_user", ["userId"])
       .index("by_created_at", ["createdAt"]),
   });
   ```

### Auto-Scaling

```yaml
# docker-compose.yml for container orchestration
version: '3.8'
services:
  airxpress:
    image: airxpress:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
```

---

## 🚨 Disaster Recovery

### Backup Strategy

1. **Database Backups**
   ```bash
   # Automated Convex backups
   # Convex provides automatic backups
   # Export data regularly for additional safety
   npx convex export backup-$(date +%Y%m%d).jsonl
   ```

2. **File Storage Backups**
   ```bash
   # S3 Cross-Region Replication
   aws s3api put-bucket-replication \
     --bucket airxpress-prod-documents \
     --replication-configuration file://replication.json
   ```

3. **Code Repository**
   - Multiple git remotes
   - Regular releases with tags
   - Docker image registry backups

### Recovery Procedures

1. **Application Recovery**
   ```bash
   # Roll back to previous deployment
   vercel --prod --force

   # Or deploy specific commit
   git checkout <commit-hash>
   vercel --prod
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   npx convex import backup-20240812.jsonl --prod
   ```

---

## 📞 Production Support

### Monitoring Alerts

```yaml
# alerts.yml (for monitoring service)
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    
  - name: High Response Time
    condition: avg_response_time > 2s
    duration: 10m
    
  - name: Low Availability
    condition: uptime < 99%
    duration: 5m
```

### On-Call Procedures

1. **Incident Response**
   - Immediate: Check status page
   - 5 min: Initial assessment and communication
   - 15 min: Begin mitigation efforts
   - 30 min: Escalate if not resolved

2. **Communication Channels**
   - Status page updates
   - User notifications
   - Internal team alerts

---

## ✅ Post-Deployment Checklist

### Immediate (First 24 hours)
- [ ] Verify all environment variables are set
- [ ] Confirm SSL certificate is valid
- [ ] Test all major user flows
- [ ] Verify payment processing
- [ ] Check error tracking is working
- [ ] Confirm monitoring alerts are active

### Short-term (First week)
- [ ] Monitor performance metrics
- [ ] Review error logs daily
- [ ] Test backup/restore procedures
- [ ] Verify security headers
- [ ] Check SEO configuration
- [ ] Review user feedback

### Long-term (First month)
- [ ] Analyze performance trends
- [ ] Review scaling requirements
- [ ] Optimize based on usage patterns
- [ ] Plan maintenance windows
- [ ] Document lessons learned

---

## 🔗 Useful Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Platform](https://vercel.com/docs)
- [Convex Production](https://docs.convex.dev/production)
- [Stripe Go-Live](https://stripe.com/docs/go-live)

### Tools
- [Vercel CLI](https://vercel.com/docs/cli)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Docker](https://docs.docker.com/)

### Monitoring
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry Error Tracking](https://sentry.io/)
- [Datadog APM](https://www.datadoghq.com/)
- [New Relic](https://newrelic.com/)

---

**Last Updated**: August 12, 2024  
**Version**: 1.0  
**Next Review**: September 12, 2024