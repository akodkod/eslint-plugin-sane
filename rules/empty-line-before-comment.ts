import type { AST, Rule } from "eslint";

type Comment = NonNullable<ReturnType<Rule.RuleContext["sourceCode"]["getAllComments"]>[number]>;

// Comments that control tools instead of explaining code
const directivePattern = /^\s*(?:(?:eslint|oxlint)-(?:disable|enable)|@ts-|cspell:|prettier-ignore|\/\s*<reference)/;
const openers = new Set(["{", "[", "(", "=>"]);

// Requires an empty line before a standalone comment, unless it starts a block or follows another comment.
const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: { description: "Require an empty line before standalone comments" },
    fixable: "whitespace",
    schema: [],
    messages: { missingEmptyLine: "Add an empty line before this comment" },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";

    function isOnSameLine(token: AST.Token | Comment | null, comment: Comment) {
      return token !== null && token.loc!.end.line === comment.loc!.start.line;
    }

    function isStandalone(comment: Comment) {
      const before = sourceCode.getTokenBefore(comment, { includeComments: true });
      return !isOnSameLine(before, comment);
    }

    function startsBlock(token: AST.Token) {
      if (openers.has(token.value)) return true;
      if (token.value !== ":") return false;

      // `case value:` and `default:` start a block, but object keys and ternaries do not
      return sourceCode.getNodeByRangeIndex(token.range[0])?.type === "SwitchCase";
    }

    function check(comment: Comment) {
      if (comment.type !== "Line" && comment.type !== "Block") return;
      if (directivePattern.test(comment.value)) return;
      if (!isStandalone(comment)) return;

      const previous = sourceCode.getTokenBefore(comment, { includeComments: true });
      if (!previous) return;

      const previousLine = sourceCode.lines[comment.loc!.start.line - 2] ?? "";
      const hasEmptyLine = previousLine.trim() === "";
      if (hasEmptyLine) return;

      const isPreviousComment = previous.type === "Line" || previous.type === "Block";
      if (isPreviousComment && isStandalone(previous as Comment)) return;

      const previousCode = sourceCode.getTokenBefore(comment);
      if (previousCode && startsBlock(previousCode)) return;

      // JSX props are kept together with no empty lines between them
      const containerType: string | undefined = sourceCode.getNodeByRangeIndex(comment.range![0])?.type;
      if (containerType === "JSXOpeningElement") return;

      const lineStart = comment.range![0] - comment.loc!.start.column;

      context.report({
        loc: comment.loc!,
        messageId: "missingEmptyLine",
        fix: fixer => fixer.insertTextBeforeRange([lineStart, lineStart], newline),
      });
    }

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) check(comment);
      },
    };
  },
};

export default rule;
