import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "./prohibited-comment-characters";

const ruleTester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});

const message = (character: string) => `Do not use "${character}" in comments. Stay a human.`;

ruleTester.run("prohibited-comment-characters", rule, {
  valid: [
    "// Load, update. Done!\n//\nconst text = '// ;';",
    "run();",
    { code: "// Load; update", options: [{ characters: ["!"] }] },
    { code: "// Load; update!", options: [{ characters: [] }] },
    { code: "/* A comment */", options: [{ characters: ["/", "*"] }] },
  ],
  invalid: [
    {
      code: "// Load; update",
      output: null,
      errors: [{ message: message(";"), line: 1, column: 8, endColumn: 9 }],
    },
    {
      code: "const value = ';'; run(); // Load; update",
      errors: [{ message: message(";"), column: 34 }],
    },
    {
      code: "// ;;\n// ;",
      errors: [
        { messageId: "prohibitedCharacter", line: 1, column: 4 },
        { messageId: "prohibitedCharacter", line: 1, column: 5 },
        { messageId: "prohibitedCharacter", line: 2, column: 4 },
      ],
    },
    {
      code: "/*\nLoad;\nupdate;\n*/",
      errors: [
        { messageId: "prohibitedCharacter", line: 2, column: 5 },
        { messageId: "prohibitedCharacter", line: 3, column: 7 },
      ],
    },
    {
      code: "/**\n * Load the record; then update it\n */\nfunction run() {}",
      errors: [{ messageId: "prohibitedCharacter", line: 2, column: 19 }],
    },
    {
      code: "const view = <div>{/* Load; update */}</div>;",
      errors: [{ messageId: "prohibitedCharacter", column: 27 }],
    },
    {
      code: "// Café 🚀;",
      errors: [{ messageId: "prohibitedCharacter", line: 1, column: 11, endColumn: 12 }],
    },
    {
      code: "// Hi!\n// Hi.\n// Hi—\n// A // tag\n// 🚀",
      options: [{ characters: ["!", ".", "—", "/", "🚀"] }],
      errors: [
        { message: message("!"), line: 1, column: 6 },
        { message: message("."), line: 2, column: 6 },
        { message: message("—"), line: 3, column: 6 },
        { message: message("/"), line: 4, column: 6 },
        { message: message("/"), line: 4, column: 7 },
        { message: message("🚀"), line: 5, column: 4, endColumn: 6 },
      ],
    },
  ],
});
