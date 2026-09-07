import type { Rule } from "eslint";

type JSXElement = Rule.Node & {
  openingElement: Rule.Node & {
    name: Rule.Node & { name?: string };
    attributes: Rule.Node[];
  };
  closingElement: Rule.Node | null;
  openingFragment: Rule.Node;
  closingFragment: Rule.Node;
  children: Rule.Node[];
};

const defaultInlineTags = [
  "abbr", "b", "bdi", "bdo", "cite", "code", "del", "dfn", "em", "i",
  "ins", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small",
  "span", "strong", "sub", "sup", "time", "u", "var",
];
const whitespaceSensitiveTags = new Set(["pre", "textarea", "script", "style"]);

const rule: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: { description: "Require tag content, child tags, and closing tags on separate lines" },
    fixable: "code",
    schema: [{
      type: "object",
      properties: {
        inlineTags: {
          type: "array",
          items: { type: "string", minLength: 1 },
          uniqueItems: true,
        },
      },
      additionalProperties: false,
    }],
    messages: {
      contentNewline: "Tag content, child tags, and closing tags should start on separate lines.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = (context.options[0] ?? {}) as { inlineTags?: string[] };
    const inlineTags = new Set([...defaultInlineTags, ...(options.inlineTags ?? [])]);
    const isInline = (node: JSXElement) =>
      !node.openingElement
        ? node.loc!.start.line === node.loc!.end.line
        : node.openingElement.attributes.length === 0 &&
          inlineTags.has(sourceCode.getText(node.openingElement.name));
    const newline = sourceCode.text.includes("\r\n") ? "\r\n" : "\n";

    return {
      "JSXElement, JSXFragment"(node: Rule.Node) {
        const element = node as JSXElement;
        const { children } = element;
        const openingElement = element.openingElement ?? element.openingFragment;
        const closingElement = element.closingElement ?? element.closingFragment;
        if (!closingElement || children.length === 0 || isInline(element)) return;

        let indent = sourceCode.lines[node.loc!.start.line - 1]!.match(/^[\t ]*/)![0];
        for (let ancestor: Rule.Node | null = node; ancestor; ancestor = ancestor.parent) {
          if (!["JSXElement", "JSXFragment"].includes(ancestor.type)) continue;
          const parent = ancestor as JSXElement;
          if (parent.openingElement) {
            if (whitespaceSensitiveTags.has(parent.openingElement.name.name!)) return;
          }
          if (isInline(parent)) continue;
          if (ancestor !== node && ancestor.loc!.start.line === node.loc!.start.line) {
            indent += "  ";
          }
        }

        const range: [number, number] = [openingElement.range![1], closingElement.range![0]];
        const content = sourceCode.text.slice(...range);
        const leading = content.match(/^[\t \r\n]*/)![0];
        const trailing = content.match(/[\t \r\n]*$/)![0];
        const needsStart = !leading.includes("\n");
        const needsEnd = !trailing.includes("\n");
        const space = (value: string) => value ? `{${JSON.stringify(value.replace(/\t/g, " "))}}` : "";
        let mixedContent: string | undefined;
        const isInlineChild = (child: Rule.Node) =>
          ["JSXElement", "JSXFragment"].includes(child.type) && isInline(child as JSXElement);
        if (children.some(child => ["JSXElement", "JSXFragment"].includes(child.type) && !isInlineChild(child))) {
          const parts: string[] = [];
          const appendWhitespace = (value: string) => {
            const lineBreaks = value.match(/\r\n|\r|\n/g)?.length ?? 0;
            if (lineBreaks) parts.push(...Array<string>(lineBreaks - 1).fill(""));
            else if (value) parts.push(space(value));
          };
          const appendText = (text: string) => {
            const before = text.match(/^[\t \r\n]*/)![0];
            const after = text.match(/[\t \r\n]*$/)![0];
            if (before === text) {
              appendWhitespace(text);
              return;
            }
            appendWhitespace(before);
            parts.push(text.slice(before.length, text.length - after.length));
            appendWhitespace(after);
          };
          let inlineContent = "";
          for (const child of children) {
            const text = sourceCode.getText(child);
            if ((child as { type: string }).type === "JSXText" || isInlineChild(child)) {
              inlineContent += text;
            } else {
              appendText(inlineContent);
              inlineContent = "";
              parts.push(text);
            }
          }
          appendText(inlineContent);
          mixedContent = newline + parts.map(part => part ? indent + "  " + part : "").join(newline) + newline + indent;
          if (mixedContent === content) return;
        } else if (!needsStart && !needsEnd) return;

        context.report({
          node,
          messageId: "contentNewline",
          fix(fixer) {
            // JSX drops line-edge spaces; make significant spaces explicit before wrapping.
            if (mixedContent !== undefined) return fixer.replaceTextRange(range, mixedContent);
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
