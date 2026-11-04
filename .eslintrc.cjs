/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  globals: {
    // uni-app / 小程序全局对象，避免 no-undef 误报
    uni: "readonly",
    wx: "readonly",
    getCurrentPages: "readonly",
    getApp: "readonly",
    UniApp: "readonly",
    Page: "readonly",
    App: "readonly",
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
