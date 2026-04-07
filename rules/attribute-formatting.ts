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

function getLineOffset(sourceCode: SourceCode, line: number): number {
  let offset = 0;
  for (let i = 0; i < line - 1; i++) {
    offset += sourceCode.lines[i]!.length + 1; // +1 for newline
  }
  return offset;
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
                  const tagNameEnd = jsxNode.name.loc.end;
                  const tokenAfterTagName = sourceCode.getTokenAfter(
                    jsxNode.name as unknown as Rule.Node,
                  )!;
                  return fixer.replaceTextRange(
                    [tagNameEnd.column + getLineOffset(sourceCode, tagNameEnd.line), tokenAfterTagName.range![0]],
                    "\n" + attrIndent,
                  );
                },
              });
            }
          } else {
            if (attr.loc.start.line !== tagLine) {
              context.report({
                node: attr,
                messageId: "singleOnSameLine",
                fix(fixer) {
                  const tagNameEnd = jsxNode.name.loc.end;
                  return fixer.replaceTextRange(
                    [
                      getLineOffset(sourceCode, tagNameEnd.line) + tagNameEnd.column,
                      attr.range![0],
                    ],
                    " ",
                  );
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
                  if (i === 0) {
                    const tagNameEnd = jsxNode.name.loc.end;
                    const rangeStart =
                      getLineOffset(sourceCode, tagNameEnd.line) +
                      tagNameEnd.column;
                    fixes.push(
                      fixer.replaceTextRange(
                        [rangeStart, attr.range![0]],
                        "\n" + attrIndent,
                      ),
                    );
                  } else {
                    const prevAttr = attributes[i - 1]!;
                    fixes.push(
                      fixer.replaceTextRange(
                        [prevAttr.range![1], attr.range![0]],
                        "\n" + attrIndent,
                      ),
                    );
                  }
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
