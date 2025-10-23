import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.config.{js,ts}",
        "**/*.test.{js,ts}",
        "**/*.spec.{js,ts}",
      ],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
  },
});
