# Testing & Code Quality

## Available Commands

### Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode (auto-rerun on changes)
npm run test:coverage # Run tests with coverage report
```

Coverage reports are generated in `coverage/`:

- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI/CD

### Linting & Formatting

```bash
npm run lint          # Check linting and formatting
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run typecheck     # TypeScript type checking
```

### Complete Validation

```bash
npm run validate      # Run typecheck + lint + test:coverage
```

This is automatically run before publishing via `prepublishOnly`.

## Coverage

Current coverage exceeds targets:

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|----------
All files |   86.56 |    79.59 |      75 |   86.15
index.ts  |   86.56 |    79.59 |      75 |   86.15
```

**Target:** Minimum 70% for all metrics

## Test Suite

**18 tests** covering:

### Tool Registration (4 tests)

- Verifies ListToolsRequestSchema handler
- Verifies CallToolRequestSchema handler
- Checks 5 tools are registered
- Validates tool names

### Tool Handlers (11 tests)

- **get_object** - API calls, optional parameters, error handling
- **get_head** - Version fetching, parameter validation
- **list_versions** - Listing versions, missing parameters
- **list_environments** - Environment listing
- **get_environment_details** - Environment details fetching
- **Error Handling** - API errors, unknown tools

### SDK Initialization (3 tests)

- Module loading
- API method availability
- SDK configuration

## Configuration

### Vitest (`vitest.config.ts`)

- Environment: Node.js
- Coverage: V8 provider
- Thresholds: 70% minimum
- Excludes: `node_modules/`, `dist/`, config/test files

### ESLint (`eslint.config.js`)

- Parser: `@typescript-eslint/parser`
- Plugin: `@typescript-eslint/eslint-plugin`
- Allows `console` for MCP logging
- Warns on `any` types (acceptable for untyped warehouse client)
- Ignores: `dist/`, `node_modules/`, `coverage/`

### Prettier (`.prettierrc`)

- 100 character line width
- Semicolons enabled
- Double quotes
- 2-space indentation

## Mocking Strategy

Tests use comprehensive mocking:

- **WarehouseSDK** - No real API calls
- **ObjectAPI** - Mocked methods: `get`, `getHead`, `listVersions`
- **EnvAPI** - Mocked methods: `list`, `get`
- **MCP Server** - Captures handler registrations
- **Environment Variables** - Set in test setup

All tests run in isolation with `vi.resetModules()`.

## Adding New Tests

When adding features, test:

1. **Happy Path** - Valid inputs, expected outputs
2. **Error Handling** - Invalid inputs, missing parameters, API errors
3. **Edge Cases** - Empty responses, null values, boundaries
4. **Integration** - Handler registration and invocation

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:

- Push to `main` branch
- Pull requests to any branch

The workflow executes `npm run validate` (typecheck + lint + test with coverage) and uploads coverage reports to Codecov.

## Troubleshooting

### Tests Failing

- Check environment variables are set in test `beforeEach`
- Ensure mocks are cleared with `vi.resetModules()`
- Verify module imports aren't cached

### Coverage Not Updating

- Delete `coverage/` directory
- Run `npm run test:coverage` again
- Check `.gitignore` excludes `coverage/`

### Linting Errors

- Run `npm run lint` to see errors
- Run `npm run lint:fix` to auto-fix
- Check `eslint.config.js` for configuration

### Type Errors

- Run `npm run typecheck`
- Check `tsconfig.json` configuration
- Ensure `@types/node` is installed

## Resources

- [Vitest](https://vitest.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)
