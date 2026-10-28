module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["@", "./src"],
          ["@components", "./src/components"],
          ["@ui", "./src/components/UI"],
          ["@pages", "./src/pages"],
          ["@utils", "./src/utils"],
          ["@types", "./src/types"],
          ["@hooks", "./src/hooks"],
          ["@services", "./src/service"],
          ["@enums", "./src/enums"],
          ["@contexts", "./src/contexts"],
        ],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      },
    },
  },
  rules: {
    "react-hooks/exhaustive-deps": "off",
  },
};
