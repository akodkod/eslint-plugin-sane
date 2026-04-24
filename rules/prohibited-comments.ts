import type { Rule } from "eslint";

const DEFAULT_KEYWORDS = ["DELETE", "REMEMBER"];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow line comments starting with prohibited keywords (e.g. DELETE, REMEMBER)",
    },
    schema: [
      {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string", minLength: 1 },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      prohibitedComment:
        "Unexpected '// {{keyword}}' comment. Remove or address it before committing.",
    },
  },

  create(context) {
    const options = (context.options[0] ?? {}) as { keywords?: string[] };
    const keywords =
      options.keywords && options.keywords.length > 0
        ? options.keywords
        : DEFAULT_KEYWORDS;

    const pattern = new RegExp(
      `^//\\s*(${keywords.map(escapeRegex).join("|")})\\b`,
    );

    const sourceCode = context.sourceCode;

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== "Line") continue;

          const raw = `//${comment.value}`;
          const match = raw.match(pattern);
          if (match) {
            context.report({
              loc: comment.loc!,
              messageId: "prohibitedComment",
              data: { keyword: match[1]! },
            });
          }
        }
      },
    };
  },
};

export default rule;
