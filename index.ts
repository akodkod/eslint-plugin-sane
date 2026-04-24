import attributeFormatting from "./rules/attribute-formatting";
import noAbbreviations from "./rules/no-abbreviations";
import prohibitedComments from "./rules/prohibited-comments";

const plugin = {
  meta: {
    name: "eslint-plugin-sane",
    version: "2.0.1",
  },
  rules: {
    "attribute-formatting": attributeFormatting,
    "no-abbreviations": noAbbreviations,
    "prohibited-comments": prohibitedComments,
  },
};

export default plugin;
