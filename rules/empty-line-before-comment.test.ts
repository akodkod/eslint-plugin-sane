import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "./empty-line-before-comment";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("empty-line-before-comment", rule, {
  valid: [
    "const first = 1;\n\n// comment\nconst second = 2;",
    "// first line\nconst value = 1;",
    "/** documentation */\nfunction run() {}",
    "const first = 1;\n\n// first\n// second\n/* third */\nconst second = 2;",
    "function run() {\n  // comment\n  work();\n}",
    "class Example {\n  // comment\n  run() {}\n}",
    "if (ready) { // explanation\n  // comment\n  run();\n}",
    "if (ready) {\n  run();\n} else {\n  // comment\n  stop();\n}",
    "try {\n  run();\n} catch {\n  // comment\n}",
    "switch (value) {\n  // before cases\n  case 1:\n    // comment\n    run();\n    break;\n  default:\n    // comment\n    stop();\n}",
    "const values = [\n  // comment\n  1,\n];",
    "const value = {\n  // comment\n  key: 1,\n};",
    "run(\n  // comment\n  value,\n);",
    "const run = () =>\n  // comment\n  work();",
    "const value = 1; // inline\nconst other = 2;",
    "first();\nsecond(); // inline\nthird();",
    "const view = (\n  <div>\n    {/* comment */}\n    <A />\n  </div>\n);",
    "run();\n// eslint-disable-next-line no-console\nconsole.log(value);",
    "run();\n// oxlint-disable-next-line no-console\nconsole.log(value);",
    "run();\n// @ts-expect-error -- legacy typing\nwork(value);",
    "run();\n/* eslint-enable no-console */",
    "run();\n// cspell:disable-next-line\nconst word = 'xyzzy';",
    "type Example = {\n  // comment\n  id: number\n}",
    "const view = (\n  <div\n    id=\"view\"\n    // comment\n    title=\"View\"\n  />\n);",
    "const view = (\n  <div\n    // comment\n    title=\"View\"\n  />\n);",
  ],
  invalid: [
    {
      code: "const first = 1;\n// comment\nconst second = 2;",
      output: "const first = 1;\n\n// comment\nconst second = 2;",
      errors: [{ messageId: "missingEmptyLine", line: 2 }],
    },
    {
      code: "first();\n// first\n// second\nsecond();",
      output: "first();\n\n// first\n// second\nsecond();",
      errors: 1,
    },
    {
      code: "first();\n/**\n * Documentation\n */\nfunction run() {}",
      output: "first();\n\n/**\n * Documentation\n */\nfunction run() {}",
      errors: 1,
    },
    {
      code: "log('hello'); // inline\n// comment\nwait();",
      output: "log('hello'); // inline\n\n// comment\nwait();",
      errors: 1,
    },
    {
      code: "first();\n// one\nsecond();\n\n// two\nthird();\n// three\nfourth();",
      output: "first();\n\n// one\nsecond();\n\n// two\nthird();\n\n// three\nfourth();",
      errors: 2,
    },
    {
      code: "class Example {\n  run() {\n    first();\n    // comment\n    second();\n  }\n}",
      output: "class Example {\n  run() {\n    first();\n\n    // comment\n    second();\n  }\n}",
      errors: 1,
    },
    {
      code: "const value = {\n  first: 1,\n  // comment\n  second: 2,\n};",
      output: "const value = {\n  first: 1,\n\n  // comment\n  second: 2,\n};",
      errors: 1,
    },
    {
      code: "switch (value) {\n  case 1:\n    run();\n    // comment\n    break;\n}",
      output: "switch (value) {\n  case 1:\n    run();\n\n    // comment\n    break;\n}",
      errors: 1,
    },
    {
      code: "const view = ready\n  ? first\n  // comment\n  : second;",
      output: "const view = ready\n  ? first\n\n  // comment\n  : second;",
      errors: 1,
    },
    {
      code: "first();\r\n// comment\r\nsecond();",
      output: "first();\r\n\r\n// comment\r\nsecond();",
      errors: 1,
    },
  ],
});
