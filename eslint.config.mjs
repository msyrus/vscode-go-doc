import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["out/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
    },
    files: ["src/**/*.ts"],
  },
];
