# Contributing to AirXpress

Thank you for your interest in contributing to AirXpress! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and npm installed
- **Git** configured with your GitHub account
- **Convex CLI** for database operations
- **Basic understanding** of Next.js, TypeScript, and React

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Airxpressv1.git
   cd Airxpressv1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Set up database**
   ```bash
   npx convex login
   npx convex dev
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## 📋 How to Contribute

### Reporting Issues

Before creating an issue:

1. **Search existing issues** to avoid duplicates
2. **Check the FAQ** in documentation
3. **Gather information** about your environment

When creating an issue:

- Use clear, descriptive titles
- Provide steps to reproduce
- Include error messages and screenshots
- Specify your environment (OS, Node version, etc.)

### Feature Requests

For new features:

1. **Check the roadmap** to see if it's already planned
2. **Create a feature request issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Proposed implementation approach
   - Screenshots or mockups (if applicable)

### Pull Requests

#### Before You Start

1. **Create or comment on an issue** to discuss your changes
2. **Fork the repository** and create a feature branch
3. **Follow naming conventions**: `feature/description`, `fix/issue-number`, `docs/update-type`

#### Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards (see below)
   - Write/update tests for your changes
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test                 # Run unit tests
   npm run lint            # Check code quality
   npm run type-check      # Verify TypeScript
   npm run build           # Test production build
   ```

4. **Commit your changes**
   ```bash
   # Use conventional commit format
   git commit -m "feat: add new pricing component
   
   - Implement dynamic markup calculation
   - Add admin controls for component pricing
   - Update tests and documentation
   
   Closes #123"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## 🏗 Project Structure

Understanding our architecture helps with contributions:

```
app/
├── api/                    # Next.js API routes
│   ├── admin/             # Admin-only endpoints
│   ├── quote/             # Quote calculation
│   └── ...                # Other business logic
├── components/            # React components
│   ├── quote/             # Quote flow components
│   ├── booking/           # Booking management
│   └── payment/           # Stripe integration
├── lib/                   # Business logic
│   ├── pricing/           # Pricing engine
│   ├── auth/              # Authentication & RBAC
│   └── validation/        # Zod schemas
└── types/                 # TypeScript definitions

convex/                    # Database & backend
├── functions/             # Convex functions
└── schemas/              # Database schemas
```

## 📏 Coding Standards

### TypeScript Guidelines

- **Use strict mode** - All files must pass TypeScript strict checks
- **Explicit types** - Avoid `any`, prefer explicit interfaces
- **Zod validation** - Use Zod schemas for all API inputs
- **Null safety** - Handle null/undefined cases explicitly

```typescript
// Good
interface UserData {
  id: string;
  email: string;
  role: UserRole;
}

const validateUser = (data: unknown): UserData => {
  return UserSchema.parse(data);
};

// Avoid
function processUser(data: any) {
  return data.email.toLowerCase(); // Unsafe
}
```

### React Component Guidelines

- **Functional components** with hooks
- **TypeScript interfaces** for all props
- **Error boundaries** for error handling
- **Accessibility** - Include ARIA attributes

```typescript
// Good
interface QuoteResultsProps {
  rates: Rate[];
  onBook: (rate: Rate) => void;
  loading?: boolean;
}

export default function QuoteResults({ 
  rates, 
  onBook, 
  loading = false 
}: QuoteResultsProps) {
  // Component implementation
}
```

### API Route Guidelines

- **Zod validation** for all inputs
- **Error handling** with proper HTTP status codes
- **Authentication** checks where required
- **Rate limiting** for public endpoints

```typescript
// Good
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = QuoteSchema.parse(body);
    
    // Business logic here
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### CSS/Styling Guidelines

- **Tailwind CSS** for all styling
- **Responsive design** - Mobile-first approach
- **Consistent spacing** - Use Tailwind spacing scale
- **Accessibility** - Proper contrast ratios

```tsx
// Good
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
    Book This Rate
  </button>
</div>
```

## 🧪 Testing Guidelines

### Unit Tests

- **Test business logic** thoroughly
- **Mock external dependencies** (APIs, database)
- **Use descriptive test names**
- **Follow AAA pattern** (Arrange, Act, Assert)

```typescript
describe('PricingEngine', () => {
  it('should apply 1.8x markup to freight component', () => {
    // Arrange
    const engine = new PricingEngine(defaultPolicy);
    const cost = { freight: 100, overweight: 0, packaging: 0 };
    
    // Act
    const result = engine.applyMarkup(cost, false);
    
    // Assert
    expect(result.freight).toBe(180);
    expect(result.total).toBeGreaterThanOrEqual(180);
  });
});
```

### Integration Tests

- **Test API endpoints** with real requests
- **Test component integration** with user interactions
- **Test authentication flows** and permissions

### Test Coverage

Maintain **>95% coverage** for:
- Business logic in `lib/` directory
- API routes
- Critical UI components

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for complex functions
- **README updates** for new features
- **API documentation** for new endpoints
- **Type definitions** with clear descriptions

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(pricing): add dynamic markup calculation

fix(auth): resolve RBAC permission check issue

docs(api): update quote endpoint documentation

test(pricing): add coverage for edge cases
```

## 🔍 Review Process

### Pull Request Requirements

- **All tests pass** (automated CI checks)
- **Code review approval** from maintainer
- **Documentation updated** if applicable
- **No merge conflicts** with main branch

### Review Criteria

Reviewers will check for:

- **Code quality** and adherence to standards
- **Test coverage** for new functionality
- **Security implications** of changes
- **Performance impact** on application
- **Documentation completeness**

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

### Release Workflow

1. **Feature freeze** for upcoming release
2. **QA testing** on staging environment
3. **Documentation review** and updates
4. **Release notes** preparation
5. **Production deployment** with monitoring
6. **Post-release monitoring** and hotfixes if needed

## 🆘 Getting Help

### Resources

- **Documentation**: `/docs` directory
- **API Reference**: `docs/API.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Examples**: Check existing components and tests

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community discussion
- **Email**: support@airxpress.com for urgent issues

### Common Issues

1. **TypeScript errors**: Check `tsconfig.json` and use strict types
2. **Build failures**: Ensure all dependencies are installed
3. **Test failures**: Run tests locally before pushing
4. **Environment issues**: Verify `.env.local` configuration

## 🙏 Recognition

Contributors will be:

- **Listed in README.md** contributors section
- **Mentioned in release notes** for significant contributions
- **Invited to team discussions** for ongoing contributors

## 📄 Legal

By contributing to AirXpress, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to AirXpress! Your efforts help make freight logistics more efficient and accessible. 🚢✈️📦