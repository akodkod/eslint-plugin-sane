import type { Rule } from "eslint";

type Comment = NonNullable<ReturnType<Rule.RuleContext["sourceCode"]["getAllComments"]>[number]>;

// Removes a comment's final period unless the comment has an earlier period.
// Adjacent standalone line comments form one block. Inline and block comments are checked alone.
const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "Remove the final period from comments with only one sentence" },
    fixable: "code",
    schema: [],
    messages: { trailingPeriod: "Remove the trailing period from a comment without earlier periods" },
  },

  create(context) {
    const sourceCode = context.sourceCode;

    function isStandaloneLine(comment: Comment) {
      if (comment.type !== "Line") return false;

      const lineStart = sourceCode.lines[comment.loc!.start.line - 1]!.slice(0, comment.loc!.start.column);
      return lineStart.trim() === "";
    }

    function groupComments(comments: Comment[]) {
      const groups: Comment[][] = [];

      for (const comment of comments) {
        const group = groups[groups.length - 1];
        const previous = group?.[group.length - 1];
        const continuesGroup = previous !== undefined
          && isStandaloneLine(previous)
          && isStandaloneLine(comment)
          && comment.loc!.start.line === previous.loc!.end.line + 1;

        if (continuesGroup) group!.push(comment);
        else groups.push([comment]);
      }

      return groups;
    }

    function check(group: Comment[]) {
      const text = group.map(comment => comment.value).join("\n").trimEnd();
      const periodCount = text.split(".").length - 1;
      if (!text.endsWith(".") || periodCount !== 1) return;

      // Empty comment lines can follow the sentence, so find the line that holds the period
      const comment = group.findLast(item => item.value.trim() !== "")!;
      const periodStart = comment.range![0] + 2 + comment.value.lastIndexOf(".");
      const periodRange: [number, number] = [periodStart, periodStart + 1];

      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(periodStart),
          end: sourceCode.getLocFromIndex(periodStart + 1),
        },
        messageId: "trailingPeriod",
        fix: fixer => fixer.removeRange(periodRange),
      });
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments()
          .filter(comment => comment.type === "Line" || comment.type === "Block");

        for (const group of groupComments(comments)) check(group);
      },
    };
  },
};

export default rule;
