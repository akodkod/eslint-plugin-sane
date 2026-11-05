import type { ESLint } from "eslint";
import { version } from "./package.json";
import attributeFormatting from "./rules/attribute-formatting";
import emptyLineBeforeComment from "./rules/empty-line-before-comment";
import noAbbreviations from "./rules/no-abbreviations";
import prohibitedCommentCharacters from "./rules/prohibited-comment-characters";
import prohibitedComments from "./rules/prohibited-comments";
import tagContentNewline from "./rules/tag-content-newline";
import trailingCommentPeriod from "./rules/trailing-comment-period";
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
    "empty-line-before-comment": emptyLineBeforeComment,
    "tag-content-newline": tagContentNewline,
    "multiline-jsx-parentheses": multilineJsxParentheses,
    "multiline-padding": multilinePadding,
    "no-abbreviations": noAbbreviations,
    "no-code-wall": noCodeWall,
    "prohibited-comment-characters": prohibitedCommentCharacters,
    "prohibited-comments": prohibitedComments,
    "trailing-comment-period": trailingCommentPeriod,
  },
};

export default plugin;
