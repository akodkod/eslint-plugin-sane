/// <reference types="bun" />
import assert from "node:assert/strict";
import { test } from "bun:test";
import { Linter, RuleTester } from "eslint";
import plugin from "../index";
import rule from "./tag-content-newline";

const languageOptions = { parserOptions: { ecmaFeatures: { jsx: true } } };
const ruleTester = new RuleTester({ languageOptions });

ruleTester.run("tag-content-newline", rule, {
  valid: [
    `<tr>\n  <td>\n    Prior responses inactive\n  </td>\n</tr>`,
    `<label>\n  My text\n</label>`,
    `<div />`,
    `<div></div>`,
    `<div>\n</div>`,
    `<p>\n  Hello, <strong>world!</strong>\n</p>`,
    ...["em", "span", "strong", "b", "i", "code", "small", "sub", "sup"].map(tag => `<${tag}>text</${tag}>`),
    `<pre><label>  preserve\n spacing </label></pre>`,
    `<textarea value="text">  text </textarea>`,
    `<script>text</script>`,
    `<style>text</style>`,
  ],
  invalid: [
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
