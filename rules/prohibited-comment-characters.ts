import type { Rule } from "eslint";

type Options = [{ characters?: string[] }?];

// Reports prohibited characters anywhere in comment text.
// The `characters` option replaces the default list. An empty list allows all characters.
const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow configured characters in comment text" },
    schema: [{
      type: "object",
      properties: {
        characters: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
      },
      additionalProperties: false,
    }],
    messages: { prohibitedCharacter: "Do not use {{character}} in comments. Stay a human." },
  },

  create(context) {
    const { characters = [";"] } = (context.options as Options)[0] ?? {};
    const prohibited = new Set(characters);
    const sourceCode = context.sourceCode;

    return {
      Program() {
        if (prohibited.size === 0) return;

        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== "Line" && comment.type !== "Block") continue;

          // Skip the `//` or `/*` delimiter, so only the comment text is checked
          let index = comment.range![0] + 2;

          // Iterate by code point, so characters outside the BMP keep correct positions
          for (const character of comment.value) {
            if (prohibited.has(character)) {
              context.report({
                loc: {
                  start: sourceCode.getLocFromIndex(index),
                  end: sourceCode.getLocFromIndex(index + character.length),
                },
                messageId: "prohibitedCharacter",
                data: { character: JSON.stringify(character) },
              });
            }

            index += character.length;
          }
        }
      },
    };
  },
};

export default rule;
