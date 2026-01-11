# Welcome to Nutrilens

## CI/CD Pipeline

This project includes automated checks for code quality:

- **Linting**: ESLint checks for code quality issues
- **Formatting**: Prettier ensures consistent code style
- **Build**: Verifies that both frontend and backend compile successfully

### Running Checks Locally

#### Frontend
```bash
cd frontend
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
npm run format:check # Check formatting without changes
npm run build       # Build the application
```

#### Backend
```bash
cd backend
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
npm run format:check # Check formatting without changes
npm run build       # Build the application
```

### GitHub Actions

The CI workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

All checks must pass before merging.