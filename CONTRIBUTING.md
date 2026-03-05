# Contributing to rootly-mcp

## Getting Started

1. Fork this repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `npm run lint` and `npm run test`
5. Submit a PR against `main`

## Adding New Tools

1. Add tool definition and handler to the appropriate module in `src/tools/`
2. Register the module in `src/server.ts` if it's a new module
3. Update README.md tool table
4. Add tests in `src/tools/__tests__/`

## Code Style

- TypeScript strict mode
- ESM modules
- Keep tool names prefixed with `rootly_`

## License

By contributing, you agree your contributions will be licensed under Apache-2.0.
