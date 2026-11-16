# Verify the repo: the same checks CI runs.
default: check

# Full check, the same command CI runs.
check:
    bun run check

# Linter alone.
lint:
    bunx biome check .

# Rewrite formatting and lint fixes.
format:
    bunx biome check --write .

# Test suite.
test:
    bun run test

# Production build.
build:
    bun run build

# Hot-reloading dev server.
dev:
    bun run dev

# Remove build output and dependencies.
clean:
    bun run clean

# Refresh dependencies to their latest allowed versions.
update:
    bun run update

# package.json script: changelog.
changelog:
    bun run changelog

# package.json script: fix.
fix:
    bun run fix

# package.json script: preview.
preview:
    bun run preview

# package.json script: release.
release:
    bun run release

# package.json script: test:coverage.
coverage:
    bun run test:coverage

# package.json script: test:watch.
test-watch:
    bun run test:watch

# package.json script: typecheck.
typecheck:
    bun run typecheck
