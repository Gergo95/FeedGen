export default {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "no-unused-vars": "warn",
    "no-undef": "error",
    quotes: ["error", "double", { allowTemplateLiterals: true }],
  },
  ignorePatterns: ["node_modules/", ".eslintrc.js"],
};
