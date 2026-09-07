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
      "sane/tag-content-newline": "error",
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
| `sane/tag-content-newline` | Require tag content and closing tags on separate lines | Yes |
| `sane/no-abbreviations` | Disallow abbreviated identifier names and suggest full-word replacements | No |
| `sane/prohibited-comments` | Disallow line comments starting with prohibited keywords (default: `DELETE`, `REMEMBER`) | No |

### JSX formatting

Enable both `sane/attribute-formatting` and `sane/tag-content-newline` to fix:

```jsx
// Before
<p
  className="mb-2 truncate text-xs text-muted-foreground"
>{callCenterAccount.username}</p>

// After
<p className="mb-2 truncate text-xs text-muted-foreground">
  {callCenterAccount.username}
</p>
```

`attribute-formatting` keeps a single one-line attribute and the opening tag's
closing delimiter together. Multiple attributes and multiline attribute values
continue to use separate lines.

`tag-content-newline` puts content after the opening tag and the closing tag on
new lines, using two spaces for inserted content indentation:

```jsx
<label>
  My text
</label>

<p>
  Hello, <strong>world!</strong>
</p>
```

Attribute-free text formatting tags may stay inline: `abbr`, `b`, `bdi`, `bdo`,
`cite`, `code`, `del`, `dfn`, `em`, `i`, `ins`, `kbd`, `mark`, `q`, `rp`, `rt`,
`ruby`, `s`, `samp`, `small`, `span`, `strong`, `sub`, `sup`, `time`, `u`, `var`.
Attributes (including spreads) remove this exception. Custom components follow
the newline rule, including components named `Span` or `Strong`.

Empty and self-closing elements are unchanged. The rule skips `pre`, `textarea`,
`script`, `style`, and their descendants to preserve whitespace-sensitive content.
Fixes preserve significant leading/trailing text spaces with explicit JSX string
expressions such as `{" "}`. Existing internal content layout is left intact;
this rule controls tag boundaries, not general indentation or sibling layout.
These rules target JSX/TSX AST nodes, not raw HTML, XML, or PHP templates.

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
