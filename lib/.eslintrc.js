module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: "module"
  },
  rules: {
    "prefer-const": ["error"]
  }
};
