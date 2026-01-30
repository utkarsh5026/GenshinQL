# Contributing to GenshinQL

Thank you for your interest in contributing to GenshinQL! This guide will help you get started with development.

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **npm** (comes with Node.js)
- **Git** for version control

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/utkarsh5026/GenshinQL.git
   cd GenshinQL/client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Husky pre-commit hooks**

   ```bash
   npm run prepare
   cd client
   npx husky init
   npx husky set .husky/pre-commit "cd client && npx lint-staged"
   npx husky set .husky/commit-msg "cd client && npx commitlint --edit $1"
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:5173](http://localhost:5173)

## Project Structure

```
GenshinQL/
├── client/                 # Main React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand state management
│   │   ├── services/       # Data fetching services
│   │   ├── routes/         # Route definitions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── assets/         # Static assets
│   ├── scripts/            # Web scraping and utility scripts
│   ├── public/             # Static JSON data files
│   └── e2e/                # End-to-end tests (if applicable)
└── .github/                # GitHub workflows and templates
```

## Coding Standards

### TypeScript

- We use **TypeScript strict mode** - all code must be properly typed
- No `any` types unless absolutely necessary
- Use interfaces for object shapes
- Export types when they might be reused

### ESLint and Prettier

- Code is automatically linted with ESLint on save (if using VSCode)
- Code is automatically formatted with Prettier on save
- Run `npm run lint` to check for linting issues
- Run `npm run lint:fix` to auto-fix linting issues
- Run `npm run format:check` to check formatting
- Run `npm run format` to auto-format files

### Styling

- Use **Tailwind CSS** utility classes for styling
- Follow the existing design patterns in the codebase
- Use Radix UI primitives for accessible components
- Leverage shadcn/ui components where available

### Import Organization

- Imports are automatically sorted by `eslint-plugin-simple-import-sort`
- Order: external packages → internal modules → relative imports

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Or for bug fixes:

```bash
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Add comments for complex logic
- Follow existing code patterns
- Keep changes focused and atomic

### 3. Commit Your Changes

We use **Conventional Commits** for commit messages. The format is:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

**Examples:**

```bash
git commit -m "feat: add character comparison feature"
git commit -m "fix: resolve talent schedule display bug"
git commit -m "docs: update installation instructions"
```

**Pre-commit Hooks:**

- Linting and formatting will run automatically before each commit
- If there are issues, the commit will be blocked - fix them and try again
- Commit messages are validated - use the conventional format above

### 4. Run Local CI Checks

Before pushing, run local validation:

```bash
npm run ci:check
```

This runs:

- ESLint checks
- TypeScript type checking
- Prettier format checking
- Production build

Alternatively, run individual checks:

```bash
npm run lint        # ESLint
npm run format:check # Prettier
npx tsc --noEmit    # TypeScript
npm run build       # Production build
```

### 5. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

### Before Submitting

1. ✅ All local CI checks pass (`npm run ci:check`)
2. ✅ Code follows project style guidelines
3. ✅ Commits use conventional commit format
4. ✅ Self-review completed
5. ✅ No new warnings or errors introduced

### Submitting a Pull Request

1. Go to the [GitHub repository](https://github.com/username/GenshinQL)
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Link any related issues (e.g., "Closes #123")
6. Request a review

### PR Requirements

- **CI must pass** - All GitHub Actions workflows must succeed
- **Conflicts resolved** - Rebase if needed
- **Description complete** - Fill out all relevant sections of the PR template
- **Changes focused** - One feature/fix per PR

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Be patient - reviews may take a few days
- Be respectful and open to feedback

## Code Review Guidelines

When reviewing others' code:

- **Be respectful and constructive**
- **Focus on code quality, not style** (style is automated)
- **Explain your reasoning** for suggested changes
- **Approve if it improves the codebase**, even if you'd do it differently
- **Test changes locally** if possible

## Common Tasks

### Adding a New Route

1. Create component in `src/routes/`
2. Add route definition in router configuration
3. Update navigation if needed

### Creating a New Component

1. Place in appropriate directory under `src/components/`
2. Use TypeScript for props
3. Follow existing component patterns
4. Use Tailwind for styling

### Adding a Zustand Store

1. Create store file in `src/stores/`
2. Define state interface
3. Implement actions
4. Export hooks

### Scraping New Data

1. Add script in `client/scripts/scrape/`
2. Use existing patterns for Selenium WebDriver
3. Validate output data
4. Update consolidation logic if needed

## Getting Help

- 📖 Check the [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
- 🔍 Search existing [issues](https://github.com/username/GenshinQL/issues)
- 💬 Ask questions in [discussions](https://github.com/username/GenshinQL/discussions)
- 🐛 Report bugs using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.yml)

## License

By contributing to GenshinQL, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GenshinQL! 🎮
