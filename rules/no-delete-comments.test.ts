import { RuleTester } from "eslint";
import rule from "./no-delete-comments";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("no-delete-comments", rule, {
  valid: [
    { code: `// This is a normal comment` },
    { code: `// Deleted this function` },
    { code: `// deleting stuff` },
    { code: `// DELETED` },
    { code: `// Delete (capitalized differently)` },
    { code: `const x = 1; // not a delete comment` },
  ],

  invalid: [
    {
      code: `// DELETE`,
      errors: [{ messageId: "noDeleteComment" }],
    },
    {
      code: `// delete`,
      errors: [{ messageId: "noDeleteComment" }],
    },
    {
      code: `// DELETE this function later`,
      errors: [{ messageId: "noDeleteComment" }],
    },
    {
      code: `// delete this after migration`,
      errors: [{ messageId: "noDeleteComment" }],
    },
    {
      code: `//DELETE`,
      errors: [{ messageId: "noDeleteComment" }],
    },
    {
      code: `//delete`,
      errors: [{ messageId: "noDeleteComment" }],
    },
  ],
});
