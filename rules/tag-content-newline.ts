import type { Rule } from "eslint";

type JSXElement = Rule.Node & {
  openingElement: Rule.Node & {
    name: { type: string; name?: string };
    attributes: Rule.Node[];
  };
  closingElement: Rule.Node | null;
  children: Rule.Node[];
};

const inlineTags = new Set([
  "abbr", "b", "bdi", "bdo", "cite", "code", "del", "dfn", "em", "i",
  "ins", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small",
  "span", "strong", "sub", "sup", "time", "u", "var",
]);
const whitespaceSensitiveTags = new Set(["pre", "textarea", "script", "style"]);

function isInline(node: JSXElement): boolean {
  const { name, attributes } = node.openingElement;
  return name.type === "JSXIdentifier" && inlineTags.has(name.name!) && attributes.length === 0;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: { description: "Require tag content and closing tags on separate lines" },
    fixable: "code",
    schema: [],
    messages: {
      contentNewline: "Tag content and the closing tag should start on new lines.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";

    return {
      JSXElement(node: Rule.Node) {
        const element = node as JSXElement;
        const { openingElement, closingElement, children } = element;
        if (!closingElement || children.length === 0 || isInline(element)) return;

        let indent = sourceCode.lines[node.loc!.start.line - 1]!.match(/^[\t ]*/)![0];
        for (let ancestor: Rule.Node | null = node; ancestor; ancestor = ancestor.parent) {
          if ((ancestor as { type: string }).type !== "JSXElement") continue;
          const parent = ancestor as JSXElement;
          if (whitespaceSensitiveTags.has(parent.openingElement.name.name!)) return;
          if (ancestor !== node && ancestor.loc!.start.line === node.loc!.start.line && !isInline(parent)) {
            indent += "  ";
          }
        }

        const range: [number, number] = [openingElement.range![1], closingElement.range![0]];
        const content = sourceCode.text.slice(...range);
        const leading = content.match(/^[\t \r\n]*/)![0];
        const trailing = content.match(/[\t \r\n]*$/)![0];
        const needsStart = !leading.includes("\n");
        const needsEnd = !trailing.includes("\n");
        if (!needsStart && !needsEnd) return;

        context.report({
          node,
          messageId: "contentNewline",
          fix(fixer) {
            // JSX drops line-edge spaces; make significant spaces explicit before wrapping.
            const space = (value: string) => value ? `{${JSON.stringify(value.replace(/\t/g, " "))}}` : "";
            let replacement = content;
            if (leading === content) {
              replacement = space(content);
            } else {
              if (needsStart) replacement = space(leading) + replacement.slice(leading.length);
              if (needsEnd && trailing) replacement = replacement.slice(0, -trailing.length) + space(trailing);
            }
            if (needsStart) replacement = newline + indent + "  " + replacement;
            if (needsEnd) replacement += newline + indent;
            return fixer.replaceTextRange(range, replacement);
          },
        });
      },
    };
  },
};

export default rule;
