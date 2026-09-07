/// <reference types="bun" />
import assert from "node:assert/strict";
import { test } from "bun:test";
import { Linter, RuleTester } from "eslint";
import plugin from "../index";
import rule from "./multiline-jsx-parentheses";

const languageOptions = { parserOptions: { ecmaFeatures: { jsx: true } } };
new RuleTester({ languageOptions }).run("multiline-jsx-parentheses", rule, {
  valid: [
    `const view = ready && <div />;`,
    `const view = ready && (\n  <div>\n    text\n  </div>\n);`,
    `const view = ready &&\n  <div>\n    text\n  </div>;`,
    `<div>\n  <span>\n    text\n  </span>\n</div>`,
  ],
  invalid: [
    {
      code: `<>{!user[fieldName] && <span className="text-sm text-muted-foreground italic">\n  Empty\n</span>}</>`,
      output: `<>{!user[fieldName] && (\n  <span className="text-sm text-muted-foreground italic">\n    Empty\n  </span>\n)}</>`,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: `function Provider() {\n  return <QueryClientProvider client={queryClient}>\n    {children}\n  </QueryClientProvider>\n}`,
      output: `function Provider() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      {children}\n    </QueryClientProvider>\n  )\n}`,
      errors: [{ messageId: "wrap" }],
    },
    ...[false, true].map(parenthesized => ({
      code: `const defaultText = ${parenthesized ? "(" : ""}<p>\n  Are you sure you want to switch office to <strong>{office.name}</strong>?\n</p>${parenthesized ? ")" : ""}`,
      output: `const defaultText = (\n  <p>\n    Are you sure you want to switch office to <strong>{office.name}</strong>?\n  </p>\n)`,
      errors: [{ messageId: "wrap" }],
    })),
    {
      code: `const view = (<>\r\n  text\r\n</>);`,
      output: `const view = (\r\n  <>\r\n    text\r\n  </>\r\n);`,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: `const view = (/* keep */ <p>\n  text\n</p>);`,
      output: null,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: `<>{memberCodes && <div>\n  {memberCodes}\n</div>}</>`,
      output: `<>{memberCodes && (\n  <div>\n    {memberCodes}\n  </div>\n)}</>`,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: `const view = ready ? <>\n  text\n</> : null;`,
      output: `const view = ready ? (\n  <>\n    text\n  </>\n) : null;`,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: `  const view = () => <div>\r\n    text\r\n  </div>;`,
      output: `  const view = () => (\r\n    <div>\r\n      text\r\n    </div>\r\n  );`,
      errors: [{ messageId: "wrap" }],
    },
    {
      code: 'const view = ready && <div>{`first\nsecond`}</div>;',
      output: 'const view = ready && (\n  <div>{`first\nsecond`}</div>\n);',
      errors: [{ messageId: "wrap" }],
    },
  ],
});

test("JSX formatting rules converge together", () => {
  const linter = new Linter();
  const config: Linter.Config = {
    languageOptions,
    plugins: { sane: plugin },
    rules: {
      "sane/multiline-jsx-parentheses": "error",
      "sane/tag-content-newline": "error",
      "sane/attribute-formatting": "error",
    },
  };
  const result = linter.verifyAndFix(`<section>\n  {memberCodes && <div>\n    {memberCodes}\n  </div>}\n</section>`, config);
  assert.equal(result.output, `<section>\n  {memberCodes && (\n    <div>\n      {memberCodes}\n    </div>\n  )}\n</section>`);
  assert.deepEqual(result.messages, []);
  assert.equal(linter.verifyAndFix(result.output, config).fixed, false);
});
