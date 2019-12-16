module.exports = {
  "env": {
      "node": true,
      "es6": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "ecmaVersion": 8,
      "sourceType": "module"
  },
  "rules": {
      "indent": [
          "off",
          4
      ],
      "quotes": [
          "warn",
          "double"
      ],
      "semi": [
          "warn",
          "always"
      ],
      "no-unused-vars": [
          "warn", {
              "vars": "all",
              "args": "after-used",
              "ignoreRestSiblings": false
          }
      ],
      "require-atomic-updates": [
          "off",
          4
      ],
      "no-irregular-whitespace": "off",
      "no-console": [
          "off"
      ]
  }
};