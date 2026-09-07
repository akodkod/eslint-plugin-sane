import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: { description: "Wrap multiline JSX starting on an expression's line in parentheses" },
    fixable: "code",
    schema: [],
    messages: { wrap: "Wrap multiline JSX in parentheses and start it on a new line." },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      "JSXElement, JSXFragment"(node: Rule.Node) {
        if (node.loc!.start.line === node.loc!.end.line) return;
        if (node.parent && ["JSXElement", "JSXFragment"].includes(node.parent.type)) return;
        const before = sourceCode.getTokenBefore(node);
        if (!before || before.loc!.end.line !== node.loc!.start.line) return;
        const after = sourceCode.getTokenAfter(node);
        const hasParentheses = before.value === "(" && after?.value === ")";

        context.report({
          node,
          messageId: "wrap",
          fix(fixer) {
            if (hasParentheses && [
              sourceCode.text.slice(before.range![1], node.range![0]),
              sourceCode.text.slice(node.range![1], after!.range![0]),
            ].some(text => !/^\s*$/.test(text))) return null;
            const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";
            const indent = sourceCode.lines[node.loc!.start.line - 1]!.match(/^[\t ]*/)![0];
            const tokens = sourceCode.getTokens(node, { includeComments: true });
            const lines = sourceCode.getText(node).split(/\r\n|\n/);
            const content = lines.map((line, index) => {
              if (index === 0) return indent + "  " + line;
              const lineNumber = node.loc!.start.line + index;
              // Preserve whitespace inside multiline literals and comments.
              if (tokens.some(token => token.type !== "JSXText" &&
                token.loc!.start.line < lineNumber && token.loc!.end.line >= lineNumber)) return line;
              return line ? "  " + line : line;
            }).join(newline);
            if (hasParentheses) {
              return fixer.replaceTextRange(
                [before.range![1], after!.range![0]],
                newline + content + newline + indent,
              );
            }
            return fixer.replaceText(node, "(" + newline + content + newline + indent + ")");
          },
        });
      },
    };
  },
};

export default rule;
