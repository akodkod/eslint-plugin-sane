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
| `sane/prohibited-comments` | Disallow line comments starting with prohibited keywords | No |

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

Set `ignoreSelfClosing` (default: `false`) to skip attribute formatting for
self-closing tags:

```js
"sane/attribute-formatting": ["error", { ignoreSelfClosing: true }]
```

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
Attributes (including spreads) remove this exception. Extend the built-in list
with case-sensitive custom component names, including member names:

```js
"sane/tag-content-newline": ["error", {
  inlineTags: ["Strong", "UI.Emphasis"],
}]
```

This keeps `<Strong>{company.name}</Strong>` together and allows it on the same
line as surrounding text. The same behavior applies to built-in inline tags.
Single-line fragments (`<>text</>`) may also stay inline. Multiline fragments
follow the normal newline rules. Parent elements still require newlines around their content:

```jsx
<p>
  Your company <Strong>{company.name}</Strong> is an existing 811spotter customer, so we just need a couple
</p>
```

The option adds to the defaults; an empty list retains all built-in inline tags.
Unlisted custom components still require newlines around their content.

Empty and self-closing elements are unchanged. The rule skips `pre`, `textarea`,
`script`, `style`, and their descendants to preserve whitespace-sensitive content.
Fixes preserve significant leading/trailing text spaces with explicit JSX string
expressions such as `{" "}` when introducing line breaks. Non-inline child tags
start on separate lines; inline tags stay with their surrounding text, even
alongside non-inline siblings. Existing line breaks and blank lines are preserved.
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

- `keywords` (`string[]`) — keywords that may not appear at the start of a line
  comment. A non-empty list replaces the defaults; an empty list uses them.
  Matching is case-sensitive and uses a word boundary, so `// deleted` and
  `// remembered` are allowed. Block comments are unchanged.

Default keywords:

```js
[
  "DELETE", "REMEMBER", "delete", "remember",
  "import", "const", "let", "export", "await", "return", "throw",
  "if", "else", "for", "while", "switch", "case", "break", "continue",
]
```

```js
"sane/prohibited-comments": ["error", { keywords: ["DELETE", "REMEMBER", "FIXME"] }],
```
