import { version } from "./package.json";
import attributeFormatting from "./rules/attribute-formatting";
import noAbbreviations from "./rules/no-abbreviations";
import prohibitedComments from "./rules/prohibited-comments";
import tagContentNewline from "./rules/tag-content-newline";

const plugin = {
  meta: {
    name: "eslint-plugin-sane",
    version,
  },
  rules: {
    "attribute-formatting": attributeFormatting,
    "tag-content-newline": tagContentNewline,
    "no-abbreviations": noAbbreviations,
    "prohibited-comments": prohibitedComments,
  },
};

export default plugin;
