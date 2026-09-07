/// <reference types="bun" />
import assert from "node:assert/strict";
import { test } from "bun:test";
import { Linter, RuleTester } from "eslint";
import { transpileModule, JsxEmit } from "typescript";
import plugin from "../index";
import rule from "./tag-content-newline";

const languageOptions = { parserOptions: { ecmaFeatures: { jsx: true } } };
const ruleTester = new RuleTester({ languageOptions });

ruleTester.run("tag-content-newline", rule, {
  valid: [
    {
      code: `<>Account <Strong>{data.profile.email}</Strong> successfully linked</>`,
      options: [{ inlineTags: ["Strong"] }],
    },
    `<>Hello <strong>world</strong></>`,
    `<p>\n  Hello <>dear <strong>world</strong></>!\n</p>`,
    `<>Hello <>world</></>`,
    {
      code: `<p className="text-center text-sm text-balance text-muted-foreground">
  Your company <Strong>{company.name}</Strong> is an existing 811spotter customer, so we just need a couple
  of details from you to get you signed in.
</p>`,
      options: [{ inlineTags: ["Strong"] }],
    },
    `<p>\n  Hello, <strong>world!</strong>\n</p>`,
    {
      code: `<>\n  Hello <UI.Strong>world</UI.Strong>!\n</>`,
      options: [{ inlineTags: ["UI.Strong"] }],
    },
    `function render() {
  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
    >
      <BaseError errors={errors} />

      {state === SignInState.Input && <EmailOrPhoneInput />}
      {state === SignInState.SelectAuthMode && <AuthMethodSelector />}
      {state === SignInState.VerifyCode && <VerifyCodeForm />}
      {state === SignInState.Password && <PasswordForm />}
      {state === SignInState.UnknownUser && <UnknownUser />}
    </AuthLayout>
  )
}`,
    `<div>\n  <A />\n\n\n  <B />\n</div>`,
    `<>\n  <A />\n\n  {ready && <B />}\n</>`,
    `<div>\r\n  <A />\r\n\r\n  <B />\r\n</div>`,
    `<div>\n\n  <A />\n\n</div>`,
    `<p>\n  Hello\n\n  <strong>world</strong>\n\n  again\n</p>`,
    { code: `<Strong>{company.name}</Strong>`, options: [{ inlineTags: ["Strong"] }] },
    { code: `<UI.Strong>text</UI.Strong>`, options: [{ inlineTags: ["UI.Strong"] }] },
    { code: `<strong>text</strong>`, options: [{ inlineTags: ["Strong"] }] },
    { code: `<em>text</em>`, options: [{ inlineTags: [] }] },
    `<tr>\n  <td>\n    Prior responses inactive\n  </td>\n</tr>`,
    `<label>\n  My text\n</label>`,
    `<div />`,
    `<div></div>`,
    `<div>\n</div>`,
    `<p>\n  Hello,\n  {" "}\n  <strong>world!</strong>\n</p>`,
    ...["em", "span", "strong", "b", "i", "code", "small", "sub", "sup"].map(tag => `<${tag}>text</${tag}>`),
    `<pre><label>  preserve\n spacing </label></pre>`,
    `<textarea value="text">  text </textarea>`,
    `<script>text</script>`,
    `<style>text</style>`,
  ],
  invalid: [
    {
      code: `<>Hello\n  world</>`,
      output: `<>\n  Hello\n  world\n</>`,
      errors: 1,
    },
    {
      code: `<>Hello\r\n  world</>`,
      output: `<>\r\n  Hello\r\n  world\r\n</>`,
      errors: 1,
    },
    {
      code: `<Strong className="x">text</Strong>`,
      options: [{ inlineTags: ["Strong"] }],
      output: `<Strong className="x">\n  text\n</Strong>`,
      errors: 1,
    },
    {
      code: `<Strong {...props}>text</Strong>`,
      options: [{ inlineTags: ["Strong"] }],
      output: `<Strong {...props}>\n  text\n</Strong>`,
      errors: 1,
    },
    {
      code: `<Strong>text</Strong>`,
      options: [{ inlineTags: ["strong"] }],
      output: `<Strong>\n  text\n</Strong>`,
      errors: 1,
    },
    { code: `<label>My text</label>`, output: `<label>\n  My text\n</label>`, errors: 1 },
    { code: `<p>{callCenterAccount.username}</p>`, output: `<p>\n  {callCenterAccount.username}\n</p>`, errors: 1 },
    { code: `<span className="x">text</span>`, output: `<span className="x">\n  text\n</span>`, errors: 1 },
    { code: `<strong {...props}>text</strong>`, output: `<strong {...props}>\n  text\n</strong>`, errors: 1 },
    { code: `<Span>text</Span>`, output: `<Span>\n  text\n</Span>`, errors: 1 },
    { code: `<UI.Label>text</UI.Label>`, output: `<UI.Label>\n  text\n</UI.Label>`, errors: 1 },
    { code: `<label>My text\n</label>`, output: `<label>\n  My text\n</label>`, errors: 1 },
    { code: `<label>\n  My text</label>`, output: `<label>\n  My text\n</label>`, errors: 1 },
    { code: `<p>Hello, <strong>world!</strong></p>`, output: `<p>\n  Hello, <strong>world!</strong>\n</p>`, errors: 1 },
    { code: `<p> Hello <em>world</em>! </p>`, output: `<p>\n  {" "}Hello <em>world</em>!{" "}\n</p>`, errors: 1 },
    { code: `<label> </label>`, output: `<label>\n  {" "}\n</label>`, errors: 1 },
    { code: `<label>{/* comment */}</label>`, output: `<label>\n  {/* comment */}\n</label>`, errors: 1 },
    { code: `  <label>text</label>`, output: `  <label>\n    text\n  </label>`, errors: 1 },
    { code: `// CRLF\r\n<label>text</label>`, output: `// CRLF\r\n<label>\r\n  text\r\n</label>`, errors: 1 },
  ],
});

for (const { name, input, output } of [
  {
    name: "inline table row and cell",
    input: `<tr><td>Prior responses inactive</td></tr>`,
    output: `<tr>\n  <td>\n    Prior responses inactive\n  </td>\n</tr>`,
  },
  {
    name: "indented table row and cell",
    input: `    <tr><td>Prior responses inactive</td></tr>`,
    output: `    <tr>\n      <td>\n        Prior responses inactive\n      </td>\n    </tr>`,
  },
  {
    name: "table row inside a table body",
    input: `<tbody><tr><td>Prior responses inactive</td></tr></tbody>`,
    output: `<tbody>\n  <tr>\n    <td>\n      Prior responses inactive\n    </td>\n  </tr>\n</tbody>`,
  },
  {
    name: "inline formatting within a table cell",
    input: `<tr><td>Prior responses <strong>inactive</strong></td></tr>`,
    output: `<tr>\n  <td>\n    Prior responses <strong>inactive</strong>\n  </td>\n</tr>`,
  },
  {
    name: "table cell attributes and expression content",
    input: `<tr><td\n  className="status"\n>{status}</td></tr>`,
    output: `<tr>\n  <td className="status">\n    {status}\n  </td>\n</tr>`,
  },
  {
    name: "table row with Windows line endings",
    input: `// CRLF\r\n<tr><td>Prior responses inactive</td></tr>`,
    output: `// CRLF\r\n<tr>\r\n  <td>\r\n    Prior responses inactive\r\n  </td>\r\n</tr>`,
  },
]) {
  test(`formatting rules fix ${name} without further changes`, () => {
    const linter = new Linter();
    const config: Linter.Config[] = [{
      languageOptions,
      plugins: { sane: plugin },
      rules: { "sane/attribute-formatting": "error", "sane/tag-content-newline": "error" },
    }];
    const result = linter.verifyAndFix(input, config);
    assert.equal(result.output, output);
    assert.deepEqual(result.messages, []);
    const secondPass = linter.verifyAndFix(result.output, config);
    assert.equal(secondPass.fixed, false);
    assert.equal(secondPass.output, output);
    assert.deepEqual(secondPass.messages, []);
  });
}

test("both formatting rules fix the reported example and converge", () => {
  const linter = new Linter();
  const config: Linter.Config[] = [{
    languageOptions,
    plugins: { sane: plugin },
    rules: { "sane/attribute-formatting": "error", "sane/tag-content-newline": "error" },
  }];
  const input = `<p\n  className="mb-2 truncate text-xs text-muted-foreground"\n>{callCenterAccount.username}</p>`;
  const result = linter.verifyAndFix(input, config);
  assert.equal(result.output, `<p className="mb-2 truncate text-xs text-muted-foreground">\n  {callCenterAccount.username}\n</p>`);
  assert.deepEqual(result.messages, []);
  assert.equal(linter.verifyAndFix(result.output, config).fixed, false);

  const nested = linter.verifyAndFix(`<div><label>text</label></div>`, config);
  assert.equal(nested.output, `<div>\n  <label>\n    text\n  </label>\n</div>`);
  assert.deepEqual(nested.messages, []);
});

for (const { input, output } of [
  {
    input: `<p>Hello <Strong>world</Strong> <hr /> again</p>`,
    output: `<p>\n  Hello <Strong>world</Strong>\n  {" "}\n  <hr />\n  {" "}\n  again\n</p>`,
  },
  {
    input: `<p>Hello <strong className="x">world</strong> again</p>`,
    output: `<p>\n  Hello\n  {" "}\n  <strong className="x">\n    world\n  </strong>\n  {" "}\n  again\n</p>`,
  },
  {
    input: `<p>Hello <strong>world</strong>\n\n  again</p>`,
    output: `<p>\n  Hello <strong>world</strong>\n\n  again\n</p>`,
  },
  {
    input: `<p>Hello\n\n  <strong>world</strong> again</p>`,
    output: `<p>\n  Hello\n\n  <strong>world</strong> again\n</p>`,
  },
  {
    input: `<>Your company <Strong>{company.name}</Strong> is a customer</>`,
    output: `<>Your company <Strong>{company.name}</Strong> is a customer</>`,
  },
  {
    input: `<p>Hello <>dear <Strong>{company.name}</Strong></>!</p>`,
    output: `<p>\n  Hello <>dear <Strong>{company.name}</Strong></>!\n</p>`,
  },
  {
    input: `<p>Your company <Strong>{company.name}</Strong> is an existing 811spotter customer, so we just need a couple</p>`,
    output: `<p>\n  Your company <Strong>{company.name}</Strong> is an existing 811spotter customer, so we just need a couple\n</p>`,
  },
  {
    input: `<p>\n  Your company <Strong>{company.name}</Strong> is a customer\n</p>`,
    output: `<p>\n  Your company <Strong>{company.name}</Strong> is a customer\n</p>`,
  },
  {
    input: `<p>Hello<strong>world</strong>!</p>`,
    output: `<p>\n  Hello<strong>world</strong>!\n</p>`,
  },
  {
    input: `<p>Hello  <strong>world</strong>  !</p>`,
    output: `<p>\n  Hello  <strong>world</strong>  !\n</p>`,
  },
  {
    input: `<p><strong>one</strong> <em>two</em></p>`,
    output: `<p>\n  <strong>one</strong> <em>two</em>\n</p>`,
  },
  {
    input: `<p>Hello{" "}<Strong>world</Strong>{" "}again</p>`,
    output: `<p>\n  Hello{" "}<Strong>world</Strong>{" "}again\n</p>`,
  },
  {
    input: `<p>Hello\n  <strong>world</strong>\n  again</p>`,
    output: `<p>\n  Hello\n  <strong>world</strong>\n  again\n</p>`,
  },
  {
    input: `<p>Hello &amp; <strong>world</strong>&nbsp;!</p>`,
    output: `<p>\n  Hello &amp; <strong>world</strong>&nbsp;!\n</p>`,
  },
  {
    input: `<p>\n  Hello\n  again <strong>world</strong>!\n</p>`,
    output: `<p>\n  Hello\n  again <strong>world</strong>!\n</p>`,
  },
  {
    input: `<p>\r\n  Hello <Strong>world</Strong> again\r\n</p>`,
    output: `<p>\r\n  Hello <Strong>world</Strong> again\r\n</p>`,
  },
]) {
  test(`mixed content preserves rendered text: ${input}`, () => {
    const linter = new Linter();
    const config: Linter.Config[] = [{
      languageOptions,
      plugins: { sane: plugin },
      rules: { "sane/tag-content-newline": ["error", { inlineTags: ["Strong"] }] },
    }];
    const result = linter.verifyAndFix(input, config);
    assert.equal(result.output, output);
    assert.deepEqual(result.messages, []);
    assert.equal(linter.verifyAndFix(result.output, config).fixed, false);

    // Use the JSX compiler to check actual text semantics, including spaces and entities.
    const renderText = (code: string) => {
      const compiled = transpileModule(code, {
        compilerOptions: { jsx: JsxEmit.React, jsxFactory: "h", jsxFragmentFactory: "Fragment" },
      }).outputText;
      return new Function("h", "Fragment", "Strong", "company", `return ${compiled}`)(
        (_tag: unknown, _props: unknown, ...children: unknown[]) => children.join(""),
        "fragment",
        "strong",
        { name: "Acme" },
      );
    };
    assert.equal(renderText(result.output), renderText(input));
  });
}
