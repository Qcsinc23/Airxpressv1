# AirXpress - Caribbean Freight Management Platform

A comprehensive freight management platform specializing in air cargo services to the Caribbean, built with Next.js 15, TypeScript, and advanced pricing systems.

## 🌟 Features

### **Core Functionality**
- **Smart Quoting System** - Instant rate calculations with eligibility validation
- **Advanced Pricing Engine** - Configurable markups and cost transparency
- **Packaging Management** - Professional packaging options with recommendations
- **Real-time Tracking** - Comprehensive shipment monitoring
- **Document Management** - Secure document upload and storage
- **Payment Processing** - Stripe integration with 3D Secure support

### **Advanced Pricing System**
- **Component-based Markups** - Individual control for freight, packaging, storage
- **"Paid Outside USA" Surcharges** - Automatic fee calculation ($10 flat or 10%)
- **Eligibility Guardrails** - JetPak limits (≤50lbs, ≤62" total dimensions)
- **Margin Analytics** - Real-time profitability analysis
- **Policy Versioning** - Audit trails and rollback capabilities

### **Professional UI/UX**
- **Transparent Pricing** - Detailed cost breakdowns for customers
- **Admin Dashboard** - Complete pricing policy management
- **Packaging Selector** - Interactive modal with smart recommendations
- **Responsive Design** - Mobile-optimized across all components
- **Role-Based Access** - Secure admin controls with RBAC

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Strict mode for enterprise-grade type safety
- **Tailwind CSS** - Utility-first styling with responsive design
- **React Hooks** - Modern state management patterns

### **Backend & Database**
- **Convex** - Real-time database with live queries
- **Next.js API Routes** - RESTful endpoints with validation
- **Zod Validation** - Runtime type checking and data validation
- **Clerk Authentication** - User management and RBAC

### **Integrations**
- **Stripe Payments** - Secure payment processing
- **AWS S3** - Document and file storage
- **Nodemailer** - Email notifications and confirmations
- **Caribbean Airlines API** - Live freight rates and tracking

### **Development & Testing**
- **Jest** - Unit and integration testing
- **ESLint** - Code quality and consistency
- **GitHub Actions** - CI/CD pipeline
- **Lighthouse** - Performance monitoring

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Convex account (for database)
- Clerk account (for authentication)
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Qcsinc23/Airxpressv1.git
   cd Airxpressv1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Convex Database
   CONVEX_DEPLOYMENT=your_convex_deployment
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   
   # Stripe Payments
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   
   # App Configuration
   BASE_URL=http://localhost:3000
   SUPPORT_EMAIL=support@yourcompany.com
   ```

4. **Database Setup**
   ```bash
   # Login to Convex and initialize
   npx convex login
   npx convex dev
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/dashboard/admin
   - Pricing Management: http://localhost:3000/dashboard/admin/pricing

## 🏗 Architecture

### **Key Components**

#### **Pricing Engine** (`app/lib/pricing/engine.ts`)
```typescript
// Calculate cost breakdown
const costBreakdown = await pricingEngine.calculateCost(input);

// Apply markup policy
const sellBreakdown = pricingEngine.applyMarkup(
  costBreakdown, 
  paidOutsideUSA
);
```

#### **Enhanced Quote Results** (`app/components/quote/QuoteResults.tsx`)
- Collapsible price breakdowns
- Eligibility warnings and suggestions
- "Paid Outside USA" surcharge toggle
- Packaging upsell integration

#### **Admin Pricing Dashboard** (`app/dashboard/admin/pricing/page.tsx`)
- Component markup management
- Live pricing preview
- Policy versioning and rollback
- Margin analytics

## 💰 Pricing System

### **Markup Formula**
```
cost_subtotal = freight + overweight + packaging + storage
sell_subtotal = ceil((freight * markup), $1) + 
                ceil((overweight * markup), $1) + 
                ceil((packaging * markup), $1) + 
                ceil((storage * markup), $1)

surcharge = paid_outside_USA ? 
  (sell_subtotal < $100 ? $10 : sell_subtotal * 10%) : $0

final_price = max(sell_subtotal + surcharge, $35)
```

### **Default Configuration**
- **Markup**: 1.80x across all components
- **Rounding**: Up to nearest $1
- **Minimum Price**: $35
- **Surcharge**: $10 (<$100) or 10% (≥$100)
- **JetPak Limits**: 50 lbs, 62" total dimensions

## 🔒 Security Features

- **Role-Based Access Control (RBAC)** - Admin, Ops, Support, User roles
- **API Route Protection** - Authenticated endpoints with permission checks
- **Input Validation** - Zod schemas for all data inputs
- **Cost Data Protection** - Customers never see internal costs
- **Audit Logging** - Complete change tracking for compliance

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm start
```

### **Environment Setup**
- Configure production environment variables
- Set up Convex production deployment
- Configure Clerk production instance
- Set up Stripe production account

### **CI/CD Pipeline**
The included GitHub Actions workflow handles:
- Automated testing on pull requests
- Type checking and linting
- Production builds and deployments
- Performance monitoring with Lighthouse

## 📊 Business Features

### **For Customers**
- Transparent pricing with detailed breakdowns
- Smart packaging recommendations
- Real-time eligibility validation
- Professional booking experience

### **For Operations**
- Complete pricing policy control
- Live margin analysis
- Packaging inventory management
- Performance analytics

### **For Administrators**
- Revenue optimization tools
- Audit compliance features
- User role management
- System configuration control

## 🔧 Development

### **Testing**
```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
```

### **Code Quality**
```bash
npm run lint          # ESLint checking
npm run type-check    # TypeScript validation
```

### **Database Development**
```bash
npx convex dev        # Start Convex development
npx convex dashboard  # Open database dashboard
```

## 📝 API Documentation

### **Quote Endpoint**
```typescript
POST /api/quote
{
  "originZip": "07001",
  "destCountry": "Guyana", 
  "pieces": [{"type": "barrel", "weight": 25}],
  "serviceLevel": "STANDARD",
  "packaging": ["sku_fiber_barrel_60l"],
  "paidOutsideUSA": true
}
```

### **Admin Pricing**
```typescript
GET /api/admin/pricing           # Get current policy
POST /api/admin/pricing          # Update policy  
GET /api/admin/pricing?action=preview  # Preview changes
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: Check the `/docs` directory
- **Issues**: GitHub Issues for bug reports
- **Email**: support@yourcompany.com

---

**Built with ❤️ for Caribbean freight logistics**
