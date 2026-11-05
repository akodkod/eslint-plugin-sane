import type { Rule } from "eslint";

type ListNode = Rule.Node & {
  body?: Rule.Node[];
  consequent?: Rule.Node[];
  members?: Rule.Node[];
};

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: { description: "Require blank lines around multiline statements and members" },
    fixable: "whitespace",
    schema: [],
    messages: { missingPadding: "Expected a blank line between these statements or members." },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";
    const indent = (node: Pick<Rule.Node, "loc">) =>
      sourceCode.lines[node.loc!.start.line - 1]!.match(/^[\t ]*/)![0];
    const isMultiline = (node: Rule.Node) => node.loc!.start.line !== node.loc!.end.line;

    function check(node: Pick<Rule.Node, "type" | "loc">) {
      const container = node as ListNode;
      const siblings = container.body ?? container.consequent ?? container.members ?? [];

      for (let index = 1; index < siblings.length; index++) {
        const previous = siblings[index - 1]!;
        const next = siblings[index]!;
        if (!isMultiline(previous) && !isMultiline(next)) continue;

        const comments = sourceCode.getTokensBetween(previous, next, { includeComments: true })
          .filter(token => token.type === "Line" || token.type === "Block");
        const boundaries = [previous, ...comments, next];
        const gaps = boundaries.slice(1).map((item, position) => ({
          left: boundaries[position]!,
          right: item,
          range: [boundaries[position]!.range![1], item.range![0]] as [number, number],
        }));

        // Inline comments belong to the preceding statement; standalone comments to the next.
        const gap = gaps.find(({ left, right }) => right.loc!.start.line > left.loc!.end.line)
          ?? gaps[gaps.length - 1]!;
        const whitespace = sourceCode.text.slice(...gap.range);
        if (/\r?\n[\t ]*\r?\n/.test(whitespace)) continue;

        context.report({
          node: next,
          messageId: "missingPadding",
          fix(fixer) {
            if (!/^\s*$/.test(whitespace)) return null;
            if (whitespace.includes("\n")) {
              return fixer.insertTextBeforeRange([gap.range[0], gap.range[0]], newline);
            }

            const ownLineSibling = siblings.find(item =>
              sourceCode.lines[item.loc!.start.line - 1]!.slice(0, item.loc!.start.column).trim() === "");
            const padding = ownLineSibling ? indent(ownLineSibling)
              : node.type === "Program" ? "" : indent(node) + "  ";
            return fixer.replaceTextRange(gap.range, newline + newline + padding);
          },
        });
      }
    }

    return {
      Program: check,
      BlockStatement: check,
      StaticBlock: check,
      SwitchCase: check,
      ClassBody: check,
      TSModuleBlock: check,
      TSInterfaceBody: check,
    };
  },
};

export default rule;
