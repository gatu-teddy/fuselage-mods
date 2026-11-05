import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    linterOptions: {
      // Stale disable-directives are a distraction during initial CI setup — warn only
      reportUnusedDisableDirectives: "off",
    },
    plugins: {
      // Re-expose the typescript-eslint plugin so we can apply TS-aware unused-var checking
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // <img> tags are used for dynamic Supabase Storage URLs — Next.js Image requires
      // a configured domain allowlist; TODO: migrate once domains are locked in
      "@next/next/no-img-element": "off",
      // Disable the base rule — it doesn't understand TypeScript function-type param labels
      "no-unused-vars": "off",
      // TypeScript-aware replacement: properly ignores type-level parameter names
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // console.log is fine in a server-side Next.js app
      "no-console": "off",
      // Legal/content pages contain many quoted strings — escaping every ' and " is noisy
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
