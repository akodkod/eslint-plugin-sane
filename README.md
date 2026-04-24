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
      "sane/prohibited-comments": "error",
    },
  },
];
```

## Rules

| Rule | Description | Fixable |
| --- | --- | --- |
| `sane/attribute-formatting` | Enforce single attributes on the same line and multiple attributes on separate lines | Yes |
| `sane/prohibited-comments` | Disallow line comments starting with prohibited keywords (default: `DELETE`, `REMEMBER`) | No |

### `sane/prohibited-comments` options

Accepts a single options object:

- `keywords` (`string[]`, default `["DELETE", "REMEMBER"]`) — keywords that
  may not appear at the start of a line comment. Matching is
  case-insensitive and uses a word boundary, so `// deleted` and
  `// remembered` are allowed.

```js
"sane/prohibited-comments": ["error", { keywords: ["DELETE", "REMEMBER", "FIXME"] }],
```
