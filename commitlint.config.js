module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type rules
    "type-enum": [
      2,
      "always",
      [
        "feat", // New features
        "fix", // Bug fixes
        "docs", // Documentation changes
        "style", // Code style changes (formatting, etc.)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system or external dependencies
        "ci", // CI/CD changes
        "chore", // Other changes that don't modify src or test files
        "revert", // Revert previous commits
        "wip", // Work in progress
        "deps", // Dependency updates
        "security", // Security fixes
        "breaking", // Breaking changes
      ],
    ],

    // Subject rules
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 72],

    // Body rules
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],

    // Footer rules
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],

    // Scope rules
    "scope-case": [2, "always", "lower-case"],
    "scope-empty": [2, "never"],
    "scope-enum": [
      2,
      "always",
      [
        "backend",
        "frontend",
        "mobile",
        "shared",
        "types",
        "config",
        "docs",
        "ci",
        "deps",
        "docker",
        "db",
        "auth",
        "api",
        "ui",
        "test",
        "security",
        "perf",
        "release",
      ],
    ],

    // Header rules
    "header-max-length": [2, "always", 100],
    "type-empty": [2, "never"],
  },

  // Custom parser for breaking changes
  parserPreset: {
    parserOpts: {
      noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"],
    },
  },
};
