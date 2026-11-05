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
      "sane/multiline-jsx-parentheses": "error",
      "sane/tag-content-newline": "error",
      "sane/no-abbreviations": ["error", {
        e: ["event", "error"],
        u: ["user", "university"],
        ua: ["userAccount"],
      }],
      "sane/prohibited-comments": "error",
      "sane/multiline-padding": "error",
      "sane/no-code-wall": "warn",
    },
  },
];
```

## Rules

| Rule | Description | Fixable |
| --- | --- | --- |
| `sane/attribute-formatting` | Enforce single attributes on the same line and multiple attributes on separate lines | Yes |
| `sane/tag-content-newline` | Require tag content and closing tags on separate lines | Yes |
| `sane/multiline-jsx-parentheses` | Wrap multiline JSX starting on an expression's line in parentheses | Yes |
| `sane/no-abbreviations` | Disallow abbreviated identifier names and suggest full-word replacements | No |
| `sane/prohibited-comments` | Disallow line comments starting with prohibited keywords | No |
| `sane/multiline-padding` | Require blank lines around multiline statements and members | Yes |
| `sane/no-code-wall` | Break long runs of mixed statements into blocks with blank lines (experimental) | No |

### JSX formatting

Enable `"sane/multiline-jsx-parentheses": "error"` to wrap multiline JSX that
starts on the same line as a surrounding expression, such as `condition && <div>`:

```jsx
{memberCodes && (
  <div>
    {memberCodes}
  </div>
)}
```

This also handles fragments, ternaries, and arrow function bodies. Existing
parentheses are reused when JSX starts beside the opening parenthesis. Single-line
JSX, JSX children, and JSX already starting on a new line are left unchanged.

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

### `sane/multiline-padding`

Requires at least one blank line before and after every multiline statement or
member. Enable it with `"sane/multiline-padding": "error"`. There are no options.
Autofixes insert missing whitespace and preserve existing extra blank lines,
indentation, and LF/CRLF line endings.

```js
// Before
const match = raw.match(pattern);
// Report the match
if (match) {
  report(match);
}
continueWork();

// After
const match = raw.match(pattern);

// Report the match
if (match) {
  report(match);
}

continueWork();
```

All multiline statements qualify, including object/array declarations, ternaries,
functions, wrapped calls, method chains, imports, and exports. The rule checks
programs, blocks, function bodies, switch-case bodies, TypeScript namespaces,
class members (including static blocks), and TypeScript interface members.
Members of object types, such as `type Example = { ... }`, are not checked.
Multiline status uses the code's start/end lines, excluding surrounding
comments.

No padding is added at scope boundaries, between array elements or object-literal
properties, inside JSX content/attributes, or between parts of an expression.
Statements inside nested function bodies are still checked, including object
methods and JSX event handlers. `else`, `catch`, `finally`, and the closing
`while` of a `do` loop stay attached to their construct.

Comments on their own lines stay with the following statement, so the blank line
goes before the first of them. A blank line between those comments and the
statement does not count. Trailing inline comments stay with the preceding
statement. A line with only spaces or tabs counts as a blank line. Same-line
siblings are split with a blank line, using sibling indentation or, when none is
available, two spaces inside the containing scope.

### `sane/no-code-wall`

Experimental. Reports runs of statements with no blank line that are long and
mix several kinds of operations. The kinds are declarations, expressions,
branches (`if`, `switch`), loops, `try`, and jumps (`return`, `throw`, `break`,
`continue`). Imports, exports, and function or class declarations end a run.
It has no autofix, because the right blocks depend on meaning.

| Option | Default | Description |
| --- | --- | --- |
| `minLines` | 5 | Fewest lines in a run before it is reported |
| `minKinds` | 2 | Fewest different kinds of operations in the run |

```js
// Before: 6 lines, 2 kinds
const missing = keys.filter(key => !variables[key]);
if (missing.length === 0) continue;
const service = services.find(Boolean);
if (!service) throw new Error("Missing service");
const source = await request(service);
const sourceVariables = parse(source);

// After
const missing = keys.filter(key => !variables[key]);
if (missing.length === 0) continue;

const service = services.find(Boolean);
if (!service) throw new Error("Missing service");

const source = await request(service);
const sourceVariables = parse(source);
```
