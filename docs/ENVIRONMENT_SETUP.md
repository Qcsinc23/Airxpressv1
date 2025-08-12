# AirXpress Environment Setup Guide

## 🎯 Overview

This comprehensive guide walks you through setting up a complete development environment for AirXpress, from initial system requirements to running the application locally.

**Estimated Setup Time:** 30-45 minutes  
**Skill Level:** Beginner to Intermediate

## 📋 Prerequisites

### System Requirements

#### Operating System Support
- **macOS** 10.15+ (Catalina or newer)
- **Windows** 10/11 with WSL2
- **Linux** Ubuntu 18.04+, CentOS 7+, or equivalent

#### Hardware Requirements
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 5GB free space
- **CPU:** Modern multi-core processor
- **Network:** Stable internet connection

#### Required Software Versions
- **Node.js:** 18.17.0+ (LTS recommended)
- **npm:** 9.0.0+ (comes with Node.js)
- **Git:** 2.30.0+
- **VS Code:** Latest (recommended editor)

## 🛠 Step 1: System Setup

### Install Node.js

#### Option A: Using Node Version Manager (Recommended)

**macOS/Linux:**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node.js 18
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Verify installation
node --version  # Should show v18.17.0
npm --version   # Should show 9.x.x
```

**Windows (PowerShell):**
```powershell
# Install nvm-windows from https://github.com/coreybutler/nvm-windows
# Then run:
nvm install 18.17.0
nvm use 18.17.0

# Verify installation
node --version
npm --version
```

#### Option B: Direct Installation
Download and install from [nodejs.org](https://nodejs.org/) - choose the LTS version.

### Install Git

**macOS:**
```bash
# Using Homebrew (recommended)
brew install git

# Or download from git-scm.com
```

**Windows:**
```bash
# Download from git-scm.com
# Or using winget:
winget install Git.Git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

### Install VS Code (Recommended)

Download from [code.visualstudio.com](https://code.visualstudio.com/) or:

```bash
# macOS with Homebrew
brew install --cask visual-studio-code

# Windows with winget
winget install Microsoft.VisualStudioCode

# Linux (Ubuntu/Debian)
sudo snap install --classic code
```

## 📁 Step 2: Project Setup

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Qcsinc23/Airxpressv1.git

# Navigate to project directory
cd Airxpressv1

# Verify you're in the right place
ls -la
# You should see package.json, next.config.js, etc.
```

### Install Dependencies

```bash
# Install all project dependencies
npm install

# This may take 2-3 minutes
# You should see "added X packages" when complete
```

**If you encounter issues:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Or use alternative package managers
# Yarn:
npm install -g yarn
yarn install

# PNPM:
npm install -g pnpm
pnpm install
```

## 🔧 Step 3: Environment Configuration

### Create Environment Files

```bash
# Copy example environment file
cp .env.example .env.local

# Open in your editor
code .env.local  # VS Code
# or
nano .env.local  # Terminal editor
```

### Required Environment Variables

#### 1. Convex (Database)
```bash
# Sign up at https://convex.dev
# Create a new project
# Copy deployment URL and key

NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key-here
```

**Setup Steps:**
1. Go to [convex.dev](https://convex.dev)
2. Sign up with GitHub account
3. Create new project named "airxpress-dev"
4. Copy the deployment URL and deploy key
5. Paste into `.env.local`

#### 2. Clerk (Authentication)
```bash
# Sign up at https://clerk.com
# Create application
# Copy keys from API Keys section

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

**Setup Steps:**
1. Go to [clerk.com](https://clerk.com)
2. Create account and new application
3. Name it "AirXpress Development"
4. Choose "Email" and "Password" for authentication
5. Go to "API Keys" in sidebar
6. Copy publishable and secret keys
7. Paste into `.env.local`

#### 3. Stripe (Payments)
```bash
# Sign up at https://stripe.com
# Use test keys for development

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # For webhook testing
```

**Setup Steps:**
1. Go to [stripe.com](https://stripe.com)
2. Create account (can skip business details for development)
3. Go to Developers → API Keys
4. Copy "Publishable key" and "Secret key" (test mode)
5. Paste into `.env.local`

#### 4. AWS S3 (File Storage - Optional for local development)
```bash
# Create AWS account and S3 bucket
# Create IAM user with S3 permissions

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=airxpress-dev-documents
```

**Setup Steps (Optional):**
1. Create AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create S3 bucket named "airxpress-dev-documents"
3. Create IAM user with S3 permissions
4. Generate access keys for the user
5. Paste into `.env.local`

### Complete .env.local Example

```bash
# Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
CLERK_SECRET_KEY=sk_test_abcd1234efgh5678ijkl9012mnop3456
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up  
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (Required)
NEXT_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud
CONVEX_DEPLOY_KEY=dev:abcd1234efgh5678ijkl9012mnop3456

# Payments (Required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Abcd1234Efgh5678
STRIPE_SECRET_KEY=sk_test_51Abcd1234Efgh5678
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# File Storage (Optional for development)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=airxpress-dev-documents

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🚀 Step 4: Database Setup

### Initialize Convex

```bash
# Install Convex CLI globally
npm install -g convex

# Login to your Convex account
npx convex login
# This will open a browser window for authentication

# Initialize Convex in your project
npx convex dev
# This will:
# 1. Create convex/ directory if it doesn't exist
# 2. Push your schema and functions to Convex
# 3. Start watching for changes

# You should see:
# "Convex functions ready! (1.23s)"
# "View logs at https://dashboard.convex.dev/..."
```

**If you see schema errors:**
```bash
# The project includes pre-built schemas
# Check convex/schema.js for any syntax errors

# Push schema manually if needed
npx convex deploy
```

### Verify Database Connection

```bash
# Open Convex dashboard
# You should see your functions and data tables
# Tables: quotes, bookings, users, pricing_policies, etc.
```

## 🎨 Step 5: VS Code Setup (Recommended)

### Install Essential Extensions

Open VS Code and install these extensions:

1. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
2. **TypeScript Importer** (`pmneo.tsimporter`)  
3. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
4. **Bracket Pair Colorizer 2** (`coenraads.bracket-pair-colorizer-2`)
5. **GitLens** (`eamodio.gitlens`)
6. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
7. **ESLint** (`dbaeumer.vscode-eslint`)
8. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

```bash
# Install via command line
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension pmneo.tsimporter
code --install-extension formulahendry.auto-rename-tag
code --install-extension eamodio.gitlens
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Recommended VS Code Snippets

Create `.vscode/snippets.json`:
```json
{
  "Next.js API Route": {
    "prefix": "napi",
    "body": [
      "import { NextRequest, NextResponse } from 'next/server';",
      "",
      "export async function ${1:GET}(request: NextRequest) {",
      "  try {",
      "    ${2:// Your code here}",
      "    ",
      "    return NextResponse.json({ success: true, data: ${3:result} });",
      "  } catch (error) {",
      "    return NextResponse.json(",
      "      { success: false, error: error.message },",
      "      { status: 500 }",
      "    );",
      "  }",
      "}"
    ]
  }
}
```

## ▶️ Step 6: Run the Application

### Start Development Servers

You need to run both the Next.js app and Convex in development mode:

```bash
# Terminal 1: Start Convex (if not already running)
npx convex dev

# Terminal 2: Start Next.js development server
npm run dev

# Or use a single command with concurrently (if configured)
npm run dev:all
```

### Verify Everything Works

1. **Open your browser** to `http://localhost:3000`
2. **You should see** the AirXpress homepage
3. **Test key features:**
   - Navigation works
   - Quote form loads
   - Sign in/Sign up buttons work
   - No console errors

### Success Indicators

✅ **Homepage loads** without errors  
✅ **Console shows** "Convex functions ready!"  
✅ **Network tab** shows successful API calls  
✅ **Authentication** redirect works  
✅ **Database connection** established  

## 🧪 Step 7: Test Your Setup

### Run the Test Suite

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Test Core Functionality

1. **Create a Quote:**
   - Go to `/quote`
   - Fill in origin/destination
   - Add package details
   - Click "Get Quote"
   - Verify results display

2. **Test Authentication:**
   - Click "Sign In"
   - Create test account
   - Verify redirect to dashboard

3. **API Testing:**
   ```bash
   # Test quote API
   curl -X POST http://localhost:3000/api/quote \
     -H "Content-Type: application/json" \
     -d '{
       "origin": {"city": "New York", "state": "NY", "zipCode": "10001"},
       "destination": {"city": "Los Angeles", "state": "CA", "zipCode": "90210"},
       "packages": [{"weight": 25, "length": 24, "width": 18, "height": 12}]
     }'
   ```

## 🔍 Step 8: Troubleshooting

### Common Issues and Solutions

#### Issue: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps flag
npm install --legacy-peer-deps
```

#### Issue: Convex connection fails
```bash
# Check your .env.local file
# Verify CONVEX_DEPLOY_KEY and NEXT_PUBLIC_CONVEX_URL

# Re-authenticate
npx convex login

# Check deployment status
npx convex dashboard
```

#### Issue: TypeScript errors
```bash
# Generate types
npm run build

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

#### Issue: Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Getting Help

If you encounter issues:

1. **Check the logs** for specific error messages
2. **Search existing issues** in the GitHub repository  
3. **Review troubleshooting guide** in `/docs/TROUBLESHOOTING.md`
4. **Ask for help** by creating a GitHub issue

## 🎉 Step 9: You're Ready!

### What You've Accomplished

✅ **System configured** with all required tools  
✅ **Project cloned** and dependencies installed  
✅ **Environment variables** set up correctly  
✅ **Database connection** established  
✅ **Development servers** running  
✅ **Core functionality** tested  

### Next Steps

1. **Explore the codebase** - Start with `/app` directory
2. **Read the documentation** - Check `/docs` for detailed guides
3. **Make your first change** - Try updating a component
4. **Run tests** - Ensure everything still works
5. **Create a feature branch** - Start contributing!

### Development Workflow

```bash
# Daily development routine
git pull origin main           # Get latest changes
npm run dev                    # Start development servers
# Make your changes
npm test                       # Run tests
npm run lint                   # Check code quality
git add .                      # Stage changes
git commit -m "feat: description"  # Commit changes
git push origin feature-branch # Push to GitHub
```

### Useful Commands

```bash
# Development
npm run dev                    # Start development servers
npm run build                  # Build for production
npm run start                  # Start production server
npm test                       # Run tests
npm run lint                   # Check code quality
npm run type-check            # TypeScript validation

# Database
npx convex dev                # Start Convex development
npx convex dashboard          # Open Convex dashboard
npx convex deploy             # Deploy functions

# Deployment
npm run deploy:staging        # Deploy to staging
npm run deploy:production     # Deploy to production
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### AirXpress Guides
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://reactjs.org/community/support.html)
- [Convex Discord](https://discord.gg/convex)

---

**Setup Complete!** 🎊  
You're now ready to contribute to AirXpress. Welcome to the team!

**Last Updated**: August 12, 2024  
**Version**: 1.0  
**Questions?** Open an issue on GitHub or check our troubleshooting guide.