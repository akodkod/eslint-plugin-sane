import { RuleTester } from "eslint";
import rule from "./prohibited-comments";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("prohibited-comments", rule, {
  valid: [
    { code: `// imports are grouped below` },
    { code: `// returns the result` },
    { code: `// format the output` },
    { code: `// Import remains case-sensitive` },
    { code: `/* const unused = true */` },
    { code: `// const unused = true`, options: [{ keywords: ["TODO"] }] },
    { code: `// This is a normal comment` },
    { code: `// Deleted this function` },
    { code: `// deleting stuff` },
    { code: `// DELETED` },
    { code: `// Delete (capitalized differently)` },
    { code: `const x = 1; // not a delete comment` },
    { code: `// remembered to do this` },
    { code: `// REMEMBERED` },
    { code: `// remembering things` },
    { code: `// Remember to ship` },
    { code: `/* DELETE */` },
    { code: `/* REMEMBER */` },
    {
      code: `// DELETE this`,
      options: [{ keywords: ["TODO"] }],
    },
    {
      code: `// REMEMBER this`,
      options: [{ keywords: ["TODO"] }],
    },
  ],

  invalid: [
    ...[
      "DELETE", "REMEMBER", "delete", "remember",
      "import", "const", "let", "export", "await", "return", "throw",
      "if", "else", "for", "while", "switch", "case", "break", "continue",
    ].map(keyword => ({
      code: `// ${keyword} example`,
      errors: [{ messageId: "prohibitedComment", data: { keyword } }],
    })),
    {
      code: `//delete`,
      errors: [{ messageId: "prohibitedComment", data: { keyword: "delete" } }],
    },
    {
      code: `//remember`,
      errors: [{ messageId: "prohibitedComment", data: { keyword: "remember" } }],
    },
    {
      code: `// const unused = true`,
      options: [{ keywords: [] }],
      errors: [{ messageId: "prohibitedComment", data: { keyword: "const" } }],
    },
    {
      code: `// DELETE`,
      errors: [{ messageId: "prohibitedComment", data: { keyword: "DELETE" } }],
    },
    {
      code: `// DELETE this function later`,
      errors: [{ messageId: "prohibitedComment", data: { keyword: "DELETE" } }],
    },
    {
      code: `//DELETE`,
      errors: [{ messageId: "prohibitedComment", data: { keyword: "DELETE" } }],
    },
    {
      code: `// REMEMBER`,
      errors: [
        { messageId: "prohibitedComment", data: { keyword: "REMEMBER" } },
      ],
    },
    {
      code: `// REMEMBER to refactor this`,
      errors: [
        { messageId: "prohibitedComment", data: { keyword: "REMEMBER" } },
      ],
    },
    {
      code: `//REMEMBER`,
      errors: [
        { messageId: "prohibitedComment", data: { keyword: "REMEMBER" } },
      ],
    },
    {
      code: `// TODO clean this up`,
      options: [{ keywords: ["TODO"] }],
      errors: [{ messageId: "prohibitedComment", data: { keyword: "TODO" } }],
    },
    {
      code: `// todo clean this up`,
      options: [{ keywords: ["TODO", "todo"] }],
      errors: [{ messageId: "prohibitedComment", data: { keyword: "todo" } }],
    },
    {
      code: `// DELETE this`,
      options: [{ keywords: ["DELETE", "FIXME"] }],
      errors: [{ messageId: "prohibitedComment", data: { keyword: "DELETE" } }],
    },
  ],
});
