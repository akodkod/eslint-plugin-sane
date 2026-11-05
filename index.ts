import type { ESLint } from "eslint";
import { version } from "./package.json";
import attributeFormatting from "./rules/attribute-formatting";
import noAbbreviations from "./rules/no-abbreviations";
import prohibitedComments from "./rules/prohibited-comments";
import tagContentNewline from "./rules/tag-content-newline";
import multilineJsxParentheses from "./rules/multiline-jsx-parentheses";
import multilinePadding from "./rules/multiline-padding";
import noCodeWall from "./rules/no-code-wall";

const plugin: ESLint.Plugin = {
  meta: {
    name: "eslint-plugin-sane",
    version,
  },
  rules: {
    "attribute-formatting": attributeFormatting,
    "tag-content-newline": tagContentNewline,
    "multiline-jsx-parentheses": multilineJsxParentheses,
    "multiline-padding": multilinePadding,
    "no-abbreviations": noAbbreviations,
    "no-code-wall": noCodeWall,
    "prohibited-comments": prohibitedComments,
  },
};

export default plugin;
