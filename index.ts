import attributeFormatting from "./rules/attribute-formatting";
import prohibitedComments from "./rules/prohibited-comments";

const plugin = {
  meta: {
    name: "eslint-plugin-sane",
    version: "1.0.0",
  },
  rules: {
    "attribute-formatting": attributeFormatting,
    "prohibited-comments": prohibitedComments,
  },
};

export default plugin;
