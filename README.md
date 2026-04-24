# eslint-plugin-sane

A collection of opinionated ESLint rules for writing sane code.

## Installation

```bash
bun install eslint-plugin-sane
```

## Usage

Add the plugin to your `eslint.config.js` (flat config):

```js
import sane from "eslint-plugin-sane";

export default [
  {
    plugins: {
      sane,
    },
    rules: {
      "sane/attribute-formatting": "error",
      "sane/no-abbreviations": ["error", {
        e: ["event", "error"],
        u: ["user", "university"],
        ua: ["userAccount"],
      }],
      "sane/prohibited-comments": "error",
    },
  },
];
```

## Rules

| Rule | Description | Fixable |
| --- | --- | --- |
| `sane/attribute-formatting` | Enforce single attributes on the same line and multiple attributes on separate lines | Yes |
| `sane/no-abbreviations` | Disallow abbreviated identifier names and suggest full-word replacements | No |
| `sane/prohibited-comments` | Disallow line comments starting with prohibited keywords (default: `DELETE`, `REMEMBER`) | No |

### `sane/no-abbreviations` options

Accepts a single options object where each key is a prohibited identifier name and the value is a non-empty array of suggested replacements. The rule has no defaults — it only reports if configured.

```js
"sane/no-abbreviations": ["error", {
  e: ["event", "error"],
  u: ["user", "university"],
  ua: ["userAccount"],
}]
```

The rule flags identifiers in **declaration positions** only (variables, parameters, function/class names, import bindings, destructuring patterns). References and object property keys are not flagged.

```js
// ❌ flagged — declaration
const u = getUser();                 // Avoid abbreviation 'u'. Alternatives: user, university
function process(ua) {}              // same
import ua from "./userAccount";      // same
const { userAccount: ua } = config;  // same

// ✅ allowed — reference or property key
doSomething(ua);
const obj = { ua: value };
```

### `sane/prohibited-comments` options

Accepts a single options object:

- `keywords` (`string[]`, default `["DELETE", "REMEMBER"]`) — keywords that
  may not appear at the start of a line comment. Matching is
  case-insensitive and uses a word boundary, so `// deleted` and
  `// remembered` are allowed.

```js
"sane/prohibited-comments": ["error", { keywords: ["DELETE", "REMEMBER", "FIXME"] }],
```
