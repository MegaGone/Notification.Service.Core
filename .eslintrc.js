module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["*rc*.js", "*config*.js", "/node_modules", "/dist"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        semi: true,
        endOfLine: "auto",
        singleQuote: false,
        trailingComma: "all",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "no-useless-escape": ["off"],
  },
};
