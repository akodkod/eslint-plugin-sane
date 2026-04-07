import attributeFormatting from "./rules/attribute-formatting";
import noDeleteComments from "./rules/no-delete-comments";

const plugin = {
  meta: {
    name: "eslint-plugin-sane",
    version: "1.0.0",
  },
  rules: {
    "attribute-formatting": attributeFormatting,
    "no-delete-comments": noDeleteComments,
  },
};

export default plugin;
