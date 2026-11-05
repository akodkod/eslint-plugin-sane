import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "./trailing-comment-period";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("trailing-comment-period", rule, {
  valid: [
    "// First sentence. Second sentence.",
    "// First sentence.\n// Second sentence.",
    "// First sentence.\n// Second sentence",
    "// See example.com.\n\n// Ask Dr. Smith.\n\n// Waiting...",
    "// See example.com\n// for details.",
    "/* First sentence.\n   Second sentence. */",
    "/**\n * First sentence.\n * Second sentence.\n */",
    "// A comment\n//\n// Question?\nconst value = '// A string.';",
    "run();",
  ],
  invalid: [
    {
      code: "// A comment.",
      output: "// A comment",
      errors: [{ messageId: "trailingPeriod", line: 1, column: 13, endColumn: 14 }],
    },
    {
      code: "// A comment\n// on two lines.",
      output: "// A comment\n// on two lines",
      errors: [{ messageId: "trailingPeriod", line: 2 }],
    },
    {
      code: "// A comment.\n//",
      output: "// A comment\n//",
      errors: [{ messageId: "trailingPeriod", line: 1 }],
    },
    {
      code: "// First. Second.\n\n// A comment.",
      output: "// First. Second.\n\n// A comment",
      errors: 1,
    },
    {
      code: "// First. Second.\nrun();\n// A comment.",
      output: "// First. Second.\nrun();\n// A comment",
      errors: 1,
    },
    {
      code: "run(); // First. Second.\nrun(); // A comment.",
      output: "run(); // First. Second.\nrun(); // A comment",
      errors: 1,
    },
    {
      code: "run(); // First. Second.\n// A comment.\nrun(); // A comment.\n// First. Second.",
      output: "run(); // First. Second.\n// A comment\nrun(); // A comment\n// First. Second.",
      errors: 2,
    },
    {
      code: "function run() {\n  // Café.  \n}",
      output: "function run() {\n  // Café  \n}",
      errors: 1,
    },
    {
      code: "/* A comment\n   on two lines. */",
      output: "/* A comment\n   on two lines */",
      errors: 1,
    },
    {
      code: "/**\n * Documentation for this function.\n */\nfunction run() {}",
      output: "/**\n * Documentation for this function\n */\nfunction run() {}",
      errors: 1,
    },
    {
      code: "const view = (\n  <div>\n    {/* A comment. */}\n  </div>\n);",
      output: "const view = (\n  <div>\n    {/* A comment */}\n  </div>\n);",
      errors: 1,
    },
    {
      code: "// .",
      output: "// ",
      errors: 1,
    },
  ],
});
