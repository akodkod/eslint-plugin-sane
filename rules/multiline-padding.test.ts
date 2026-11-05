import assert from "node:assert/strict";
import { test } from "bun:test";
import { Linter, RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";
import plugin from "../index";
import rule from "./multiline-padding";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

const example1 = `let indent = sourceCode.lines[node.loc!.start.line - 1]!.match(/^[\\t ]*/)![0];
for (let ancestor: Rule.Node | null = node; ancestor; ancestor = ancestor.parent) {
  if (!["JSXElement", "JSXFragment"].includes(ancestor.type)) continue;
  const parent = ancestor as JSXElement;
  if (parent.openingElement) {
    if (whitespaceSensitiveTags.has(parent.openingElement.name.name!)) return;
    if (isInline(parent)) continue;
  }
  if (ancestor !== node && ancestor.loc!.start.line === node.loc!.start.line) {
    indent += "  ";
  }
}`;
const example2 = `for (const comment of sourceCode.getAllComments()) {
  if (comment.type !== "Line") continue;

  const raw = \`//\${comment.value}\`;
  const match = raw.match(pattern);
  if (match) {
    context.report({
      loc: comment.loc!,
      messageId: "prohibitedComment",
      data: { keyword: match[1]! },
    });
  }
}`;

const multilineStatements = [
  "if (ready) {\n  run();\n}",
  "for (;;) {\n  break;\n}",
  "while (ready) {\n  run();\n}",
  "function run() {\n  work();\n}",
  "const run = () => {\n  work();\n};",
  "const value = {\n  a: 1,\n  b: 2,\n};",
  "const value = [\n  1,\n  2,\n];",
  "const value = ready\n  ? yes\n  : no;",
  "run(\n  value,\n);",
  "client\n  .fetch()\n  .then(run);",
  "import {\n  value,\n} from 'module';",
  "export const value = {\n  a: 1,\n};",
  "const view = <div>\n  <A />\n  <B />\n</div>;",
  "const value = `first\nsecond`;",
];

const cases: { code: string; output: string; errors: number }[] = [
  {
    code: example1,
    output: example1.replace(";\nfor", ";\n\nfor")
      .replace("JSXElement;\n", "JSXElement;\n\n")
      .replace("  }\n  if", "  }\n\n  if"),
    errors: 3,
  },
  {
    code: example2,
    output: example2.replace("raw.match(pattern);\n", "raw.match(pattern);\n\n"),
    errors: 1,
  },
  ...multilineStatements.map(statement => ({
    code: `before();\n${statement}\nafter();`,
    output: `before();\n\n${statement}\n\nafter();`,
    errors: 2,
  })),
  ...[
    ["function run() {", "}"],
    ["switch (value) { case 1:", "}"],
    ["namespace Example {", "}"],
    ["class Example { static {", "} }"],
    ["const value = { run() {", "} };"],
    ["const value = [() => {", "}];"],
    ["const view = <Button onClick={() => {", "}} />;"],
    ["const view = <>{(() => {", "})()}</>;"],
  ].map(([open, close]) => ({
    code: `${open}\n  before();\n  if (ready) {\n    run();\n  }\n  after();\n${close}`,
    output: `${open}\n  before();\n\n  if (ready) {\n    run();\n  }\n\n  after();\n${close}`,
    errors: 2,
  })),
  ...[
    ["class Example {", "  first() {\n    run();\n  }", "  second() {}", "}"],
    ["interface Example {", "  first: {\n    value: string;\n  };", "  second: number;", "}"],
  ].map(([open, first, second, close]) => ({
    code: `${open}\n${first}\n${second}\n${close}`,
    output: `${open}\n${first}\n\n${second}\n${close}`,
    errors: 1,
  })),
  ...["// explanation", "/** documentation */", "/* first\n\nlast */", "// first\n// second"].map(comment => ({
    code: `before(); // trailing\n${comment}\nif (ready) {\n  run();\n}`,
    output: `before(); // trailing\n\n${comment}\nif (ready) {\n  run();\n}`,
    errors: 1,
  })),
  {
    code: "before();\n// comment\n\nif (ready) {\n  run();\n}",
    output: "before();\n\n// comment\n\nif (ready) {\n  run();\n}",
    errors: 1,
  },
  {
    code: "before();\n/**\n * Documentation\n */\nfunction run() {\n  work();\n}",
    output: "before();\n\n/**\n * Documentation\n */\nfunction run() {\n  work();\n}",
    errors: 1,
  },
  {
    code: "class Example {\n  value = 1;\n  // comment\n  run() {\n    work();\n  }\n}",
    output: "class Example {\n  value = 1;\n\n  // comment\n  run() {\n    work();\n  }\n}",
    errors: 1,
  },
  {
    code: "if (ready) {\n  run();\n} // trailing\nafter();",
    output: "if (ready) {\n  run();\n} // trailing\n\nafter();",
    errors: 1,
  },
  {
    code: "before(); /* trailing */ /* also trailing */\nif (ready) {\n  run();\n}",
    output: "before(); /* trailing */ /* also trailing */\n\nif (ready) {\n  run();\n}",
    errors: 1,
  },
  {
    code: "before();\r\nif (ready) {\r\n  run();\r\n}",
    output: "before();\r\n\r\nif (ready) {\r\n  run();\r\n}",
    errors: 1,
  },
  {
    code: "before()\nif (ready) {\n  run()\n}\nafter()",
    output: "before()\n\nif (ready) {\n  run()\n}\n\nafter()",
    errors: 2,
  },
  {
    code: "before(); if (ready) {\n  run();\n} after();",
    output: "before();\n\nif (ready) {\n  run();\n}\n\nafter();",
    errors: 2,
  },
  {
    code: "function run() { before(); if (ready) {\n    work();\n  } after(); }",
    output: "function run() { before();\n\n  if (ready) {\n    work();\n  }\n\n  after(); }",
    errors: 2,
  },
  {
    code: "function run() {\n\tbefore();\n\tif (ready) {\n\t\twork();\n\t}\n}",
    output: "function run() {\n\tbefore();\n\n\tif (ready) {\n\t\twork();\n\t}\n}",
    errors: 1,
  },
];

ruleTester.run("multiline-padding", rule, {
  valid: [
    ...new Set(cases.map(({ output }) => output)),
    "first();\nsecond();",
    "type Example = {\n  id: number\n  user?: {\n    email: string\n  } | null\n  run(): void\n}",
    "const value: {\n  first: {\n    value: string\n  }\n  second: number\n} = input;",
    "// multiline\n// comment\nfirst();\nsecond();",
    "if (ready) {\n  run();\n}",
    "before();\n \t\nif (ready) {\n  run();\n}\n\n\nafter();",
    "before();\n\n// comment\nif (ready) {\n  run();\n}",
    "before();\n\n// first\n\n// second\nif (ready) {\n  run();\n}",
    "const value = {\n  first: {\n    nested: true,\n  },\n  second: {\n    nested: true,\n  },\n};",
    "const value = [\n  {\n    first: true,\n  },\n  {\n    second: true,\n  },\n];",
    "const view = <div>\n  {ready\n    ? <A />\n    : <B />}\n  <C>\n    text\n  </C>\n</div>;",
    "if (ready) {\n  first();\n} else if (other) {\n  second();\n} else {\n  third();\n}",
    "try {\n  run();\n} catch (error) {\n  recover();\n} finally {\n  finish();\n}",
    "do {\n  run();\n} while (ready);",
    "switch (value) {\n  case 1:\n    run(\n      value,\n    );\n  case 2:\n    break;\n}",
  ],
  invalid: cases,
});

test("autofixes are idempotent with the default JavaScript parser", () => {
  const linter = new Linter();
  const config = { plugins: { sane: plugin }, rules: { "sane/multiline-padding": "error" as const } };
  const result = linter.verifyAndFix("before();\nif (ready) {\n  run();\n}\nafter();", config);
  assert.equal(result.output, "before();\n\nif (ready) {\n  run();\n}\n\nafter();");
  assert.deepEqual(result.messages, []);
  assert.equal(linter.verifyAndFix(result.output, config).fixed, false);
});

test("converges with existing JSX formatting rules on TSX", () => {
  const linter = new Linter();
  const config = {
    files: ["**/*.tsx"],
    languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { sane: plugin },
    rules: {
      "sane/multiline-padding": "error" as const,
      "sane/attribute-formatting": "error" as const,
      "sane/tag-content-newline": "error" as const,
      "sane/multiline-jsx-parentheses": "error" as const,
    },
  };
  const code = 'const count: number = 1;\nconst view = <div id="view" title="View"><A /><B /></div>;\nafter();';
  const result = linter.verifyAndFix(code, config, { filename: "example.tsx" });
  assert.equal(result.fixed, true);
  assert.deepEqual(result.messages, []);
  assert.match(result.output, /1;\n\nconst view/);
  assert.match(result.output, /;\n\nafter\(\);/);
  assert.equal(linter.verifyAndFix(result.output, config, { filename: "example.tsx" }).fixed, false);
});
