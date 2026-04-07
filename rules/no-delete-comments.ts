import type { Rule } from "eslint";

const deletePattern = /^\/\/\s*(DELETE|delete)\b/;

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow comments starting with // DELETE or // delete",
    },
    schema: [],
    messages: {
      noDeleteComment: "Unexpected '// DELETE' comment. Remove the commented code.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== "Line") continue;

          const raw = `//${comment.value}`;
          if (deletePattern.test(raw)) {
            context.report({
              loc: comment.loc!,
              messageId: "noDeleteComment",
            });
          }
        }
      },
    };
  },
};

export default rule;
