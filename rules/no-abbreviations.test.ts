import { RuleTester } from "eslint";
import rule from "./no-abbreviations";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

const options = [{ c: ["callCenter", "company"], cc: ["callCenterCompany"] }];

ruleTester.run("no-abbreviations", rule, {
  valid: [
    // Empty config → no violations
    { code: `const c = 1` },
    { code: `function c(cc) {}` },

    // Name not in the abbreviations map
    {
      code: `const count = 1`,
      options,
    },
    {
      code: `function process(count) {}`,
      options,
    },

    // Object property key (not a binding) — should not be flagged
    {
      code: `const obj = { c: 1 }`,
      options,
    },
    {
      code: `const obj = { c: value }`,
      options,
    },

    // Reference (not a declaration) — should not be flagged
    {
      code: `const x = c + 1`,
      options,
    },
    {
      code: `foo(c)`,
      options,
    },

    // Import specifier original name (not local) — should not be flagged
    {
      code: `import { c as callCenter } from 'mod'`,
      options,
    },

    // Shorthand property in object literal (not destructuring) — not flagged
    {
      code: `const callCenter = 1; const obj = { callCenter }`,
      options,
    },
  ],

  invalid: [
    // Variable declaration
    {
      code: `const c = 1`,
      options,
      errors: [
        {
          messageId: "noAbbreviation",
          data: { name: "c", suggestions: "callCenter, company" },
        },
      ],
    },

    // let / var
    {
      code: `let c = 1`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },
    {
      code: `var c = 1`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Function parameter
    {
      code: `function foo(c) {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Function name
    {
      code: `function c() {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Arrow function parameter
    {
      code: `const fn = (c) => c`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Class name
    {
      code: `class c {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Import default
    {
      code: `import c from 'mod'`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Import local binding (alias)
    {
      code: `import { something as c } from 'mod'`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Import namespace
    {
      code: `import * as c from 'mod'`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Destructuring: value binding position
    {
      code: `const { a: c } = obj`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Destructuring: shorthand (both key and binding)
    {
      code: `const { c } = obj`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Rest element
    {
      code: `function foo(...c) {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Multiple abbreviations in one file
    {
      code: `const c = 1; const cc = 2`,
      options,
      errors: [
        { messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } },
        { messageId: "noAbbreviation", data: { name: "cc", suggestions: "callCenterCompany" } },
      ],
    },

    // FunctionExpression name
    {
      code: `const fn = function c() {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // FunctionExpression param
    {
      code: `const fn = function(c) {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },

    // Default parameter value binding
    {
      code: `function foo(c = 1) {}`,
      options,
      errors: [{ messageId: "noAbbreviation", data: { name: "c", suggestions: "callCenter, company" } }],
    },
  ],
});
