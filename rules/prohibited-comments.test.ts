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
    { code: `// This is a normal comment` },
    { code: `// Deleted this function` },
    { code: `// deleting stuff` },
    { code: `// DELETED` },
    { code: `// delete` },
    { code: `// delete this after migration` },
    { code: `// Delete (capitalized differently)` },
    { code: `//delete` },
    { code: `const x = 1; // not a delete comment` },
    { code: `// remembered to do this` },
    { code: `// REMEMBERED` },
    { code: `// remembering things` },
    { code: `// remember to refactor this` },
    { code: `// Remember to ship` },
    { code: `//remember` },
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
