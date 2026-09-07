import type { Rule, SourceCode } from "eslint";

type JSXNode = Rule.Node & {
  name: { loc: NonNullable<Rule.Node["loc"]> };
  attributes: (Rule.Node & { loc: NonNullable<Rule.Node["loc"]> })[];
  selfClosing: boolean;
};

function isMultiline(node: { loc: NonNullable<Rule.Node["loc"]> }): boolean {
  return node.loc.start.line !== node.loc.end.line;
}

function getIndent(sourceCode: SourceCode, node: Rule.Node): string {
  const line = sourceCode.lines[node.loc!.start.line - 1] ?? "";
  const match = line.match(/^(\s*)/);
  return match?.[1] ?? "";
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description:
        "Enforce single attributes on the same line and multiple attributes on separate lines",
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      singleOnSameLine:
        "A single attribute should be on the same line as the opening tag.",
      singleMultilineOnSeparateLine:
        "A single multiline attribute should be on a separate line.",
      multipleOnSeparateLines:
        "Multiple attributes should each be on a separate line.",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";

    return {
      JSXOpeningElement(node: Rule.Node) {
        const jsxNode = node as unknown as JSXNode;
        const attributes = jsxNode.attributes;

        if (attributes.length === 0) return;

        const tagLine = jsxNode.name.loc.start.line;
        const indent = getIndent(sourceCode, node);
        const attrIndent = indent + "  ";

        if (attributes.length === 1) {
          const attr = attributes[0]!;

          if (isMultiline(attr)) {
            if (attr.loc.start.line === tagLine) {
              context.report({
                node: attr,
                messageId: "singleMultilineOnSeparateLine",
                fix(fixer) {
                  const range: [number, number] = [
                    sourceCode.getTokenBefore(attr)!.range![1], attr.range![0],
                  ];
                  if (!/^\s*$/.test(sourceCode.text.slice(...range))) return null;
                  return fixer.replaceTextRange(range, newline + attrIndent);
                },
              });
            }
          } else {
            if (attr.loc.start.line !== tagLine || node.loc!.end.line !== attr.loc.end.line) {
              context.report({
                node: attr,
                messageId: "singleOnSameLine",
                fix(fixer) {
                  const before: [number, number] = [
                    sourceCode.getTokenBefore(attr)!.range![1],
                    attr.range![0],
                  ];
                  const after: [number, number] = [
                    attr.range![1],
                    sourceCode.getTokenAfter(attr)!.range![0],
                  ];
                  // Keep comments between the attribute and tag delimiters.
                  if (![before, after].every(([start, end]) =>
                    /^\s*$/.test(sourceCode.text.slice(start, end)))) return null;
                  return [
                    fixer.replaceTextRange(before, " "),
                    fixer.replaceTextRange(after, jsxNode.selfClosing ? " " : ""),
                  ];
                },
              });
            }
          }
        } else {
          let hasError = false;

          if (attributes[0]!.loc.start.line === tagLine) {
            hasError = true;
          }

          if (!hasError) {
            for (let i = 1; i < attributes.length; i++) {
              if (
                attributes[i]!.loc.start.line === attributes[i - 1]!.loc.end.line
              ) {
                hasError = true;
                break;
              }
            }
          }

          if (hasError) {
            context.report({
              node,
              messageId: "multipleOnSeparateLines",
              fix(fixer) {
                const fixes: Rule.Fix[] = [];

                for (let i = 0; i < attributes.length; i++) {
                  const attr = attributes[i]!;
                  const range: [number, number] = [
                    sourceCode.getTokenBefore(attr)!.range![1], attr.range![0],
                  ];
                  if (!/^\s*$/.test(sourceCode.text.slice(...range))) return null;
                  fixes.push(fixer.replaceTextRange(range, newline + attrIndent));
                }

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
