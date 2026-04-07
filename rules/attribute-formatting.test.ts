import { RuleTester } from "eslint";
import rule from "./attribute-formatting";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run("attribute-formatting", rule, {
  valid: [
    // No attributes
    {
      code: `<div />`,
    },

    // Single attribute on same line
    {
      code: `<div className="foo" />`,
    },

    // Single attribute on same line (not self-closing)
    {
      code: `<div className="foo"></div>`,
    },

    // Single spread attribute on same line
    {
      code: `<div {...props} />`,
    },

    // Multiple attributes each on own line
    {
      code: [
        `<div`,
        `  className="foo"`,
        `  id="bar"`,
        `/>`,
      ].join("\n"),
    },

    // Multiple attributes each on own line (3 attrs)
    {
      code: [
        `<Component`,
        `  className="foo"`,
        `  id="bar"`,
        `  onClick={handler}`,
        `/>`,
      ].join("\n"),
    },

    // Single multiline attribute on separate line
    {
      code: [
        `<div`,
        `  className={`,
        `    someCondition ? "foo" : "bar"`,
        `  }`,
        `/>`,
      ].join("\n"),
    },

    // Single multiline callback on separate line
    {
      code: [
        `<button`,
        `  onClick={() => {`,
        `    doSomething();`,
        `  }}`,
        `/>`,
      ].join("\n"),
    },
  ],

  invalid: [
    // Single attribute on separate line (should be on same line)
    {
      code: [
        `<div`,
        `  className="foo"`,
        `/>`,
      ].join("\n"),
      output: `<div className="foo"\n/>`,
      errors: [{ messageId: "singleOnSameLine" }],
    },

    // Multiple attributes on same line (should be separate)
    {
      code: `<div className="foo" id="bar" />`,
      output: [
        `<div`,
        `  className="foo"`,
        `  id="bar" />`,
      ].join("\n"),
      errors: [{ messageId: "multipleOnSeparateLines" }],
    },

    // Multiple attributes, first on same line as tag
    {
      code: [
        `<div className="foo"`,
        `  id="bar"`,
        `/>`,
      ].join("\n"),
      output: [
        `<div`,
        `  className="foo"`,
        `  id="bar"`,
        `/>`,
      ].join("\n"),
      errors: [{ messageId: "multipleOnSeparateLines" }],
    },

    // Three attributes all on one line
    {
      code: `<Component a="1" b="2" c="3" />`,
      output: [
        `<Component`,
        `  a="1"`,
        `  b="2"`,
        `  c="3" />`,
      ].join("\n"),
      errors: [{ messageId: "multipleOnSeparateLines" }],
    },

    // Single multiline attribute on same line as tag
    {
      code: [
        `<div className={`,
        `  someCondition ? "foo" : "bar"`,
        `} />`,
      ].join("\n"),
      output: [
        `<div`,
        `  className={`,
        `  someCondition ? "foo" : "bar"`,
        `} />`,
      ].join("\n"),
      errors: [{ messageId: "singleMultilineOnSeparateLine" }],
    },
  ],
});
