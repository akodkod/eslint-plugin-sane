import type { Rule } from "eslint";
import type {
  Pattern,
  Identifier,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  ClassDeclaration,
  ClassExpression,
} from "estree";

type AbbreviationsMap = Record<string, string[]>;

type FunctionNode = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;
type ClassNode = ClassDeclaration | ClassExpression;

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow abbreviated identifier names and suggest full-word replacements",
    },
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string", minLength: 1 },
          minItems: 1,
        },
      },
    ],
    messages: {
      noAbbreviation:
        "Avoid abbreviation '{{name}}'. Alternatives: {{suggestions}}.",
    },
  },

  create(context) {
    const abbreviations = (context.options[0] ?? {}) as AbbreviationsMap;

    if (Object.keys(abbreviations).length === 0) {
      return {};
    }

    function reportIfAbbreviation(node: Identifier) {
      const suggestions = abbreviations[node.name];
      if (suggestions) {
        context.report({
          node,
          messageId: "noAbbreviation",
          data: { name: node.name, suggestions: suggestions.join(", ") },
        });
      }
    }

    // Recursively walk binding patterns to find all declared identifiers.
    function checkPattern(pattern: Pattern) {
      switch (pattern.type) {
        case "Identifier":
          reportIfAbbreviation(pattern);
          break;
        case "ObjectPattern":
          for (const prop of pattern.properties) {
            if (prop.type === "RestElement") {
              checkPattern(prop.argument as Pattern);
            } else {
              // prop.value is the binding target (not the key)
              checkPattern(prop.value as Pattern);
            }
          }
          break;
        case "ArrayPattern":
          for (const element of pattern.elements) {
            if (element) checkPattern(element);
          }
          break;
        case "AssignmentPattern":
          checkPattern(pattern.left);
          break;
        case "RestElement":
          checkPattern(pattern.argument as Pattern);
          break;
      }
    }

    function checkFunctionNode(node: FunctionNode) {
      if ("id" in node && node.id) reportIfAbbreviation(node.id);
      for (const param of node.params) checkPattern(param as Pattern);
    }

    return {
      VariableDeclarator(node) {
        checkPattern(node.id as Pattern);
      },
      FunctionDeclaration: checkFunctionNode,
      FunctionExpression: checkFunctionNode,
      ArrowFunctionExpression: checkFunctionNode,
      ClassDeclaration(node: ClassNode) {
        if (node.id) reportIfAbbreviation(node.id);
      },
      ClassExpression(node: ClassNode) {
        if (node.id) reportIfAbbreviation(node.id);
      },
      ImportDefaultSpecifier(node) {
        reportIfAbbreviation(node.local);
      },
      ImportNamespaceSpecifier(node) {
        reportIfAbbreviation(node.local);
      },
      ImportSpecifier(node) {
        reportIfAbbreviation(node.local);
      },
    };
  },
};

export default rule;
