import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Global ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      ".vercel/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",
      "public/**",
      "coverage/**",
      ".git/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },

  // Global settings and rules
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        NodeJS: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      // General JavaScript/TypeScript rules
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      "prefer-const": "warn",
      "no-var": "error",
      "no-undef": "off", // TypeScript handles this

      // React rules
      "react/react-in-jsx-scope": "off", // Not needed with Next.js
      "react/prop-types": "off", // Using TypeScript
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Relaxed rules for test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
    },
  },

  // Relaxed rules for config and script files
  {
    files: ["**/*.config.*", "**/scripts/**/*", "prisma/**/*"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  // Server-side files (app directory, server actions, API routes)
  {
    files: [
      "app/**/*.ts",
      "app/**/*.tsx",
      "lib/**/*.ts",
      "middleware.ts",
    ],
    rules: {
      // Allow console in server-side code for debugging
      "no-console": "off",
    },
  },
];

export default eslintConfig;
