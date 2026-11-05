import type { Rule } from "eslint";

type ListNode = Rule.Node & {
  body?: Rule.Node[];
  consequent?: Rule.Node[];
};

// Statement types that count as one kind of operation when judging a run of lines
const operationKinds: Record<string, string> = {
  VariableDeclaration: "declaration",
  ExpressionStatement: "expression",
  IfStatement: "branch",
  SwitchStatement: "branch",
  ForStatement: "loop",
  ForInStatement: "loop",
  ForOfStatement: "loop",
  WhileStatement: "loop",
  DoWhileStatement: "loop",
  TryStatement: "try",
  ReturnStatement: "jump",
  ThrowStatement: "jump",
  BreakStatement: "jump",
  ContinueStatement: "jump",
};

type Options = [{ minLines?: number; minKinds?: number }?];

// Experimental. Finds runs of statements with no blank line that mix several kinds of operations.
// Imports, exports, and function or class declarations are not operations, so they end a run.
const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: { description: "Break long runs of mixed statements into blocks with blank lines" },
    schema: [{
      type: "object",
      properties: {
        minLines: { type: "integer", minimum: 2 },
        minKinds: { type: "integer", minimum: 2 },
      },
      additionalProperties: false,
    }],
    messages: {
      codeWall: "{{lineCount}} lines mix {{kindCount}} kinds of operations ({{kinds}}) with no blank line. Add blank lines to split them into blocks.",
    },
  },

  create(context) {
    const { minLines = 5, minKinds = 2 } = (context.options as Options)[0] ?? {};
    const lines = context.sourceCode.lines;

    function hasBlankLineBetween(previous: Rule.Node, next: Rule.Node) {
      for (let line = previous.loc!.end.line + 1; line < next.loc!.start.line; line++) {
        if (lines[line - 1]!.trim() === "") return true;
      }

      return false;
    }

    function reportWall(run: Rule.Node[]) {
      const first = run[0];
      const last = run[run.length - 1];
      if (!first || !last) return;

      const lineCount = last.loc!.end.line - first.loc!.start.line + 1;
      const kinds = new Set(run.map(statement => operationKinds[statement.type]));
      if (lineCount < minLines || kinds.size < minKinds) return;

      context.report({
        loc: { start: first.loc!.start, end: last.loc!.end },
        messageId: "codeWall",
        data: { lineCount: String(lineCount), kindCount: String(kinds.size), kinds: [...kinds].join(", ") },
      });
    }

    function check(node: Pick<Rule.Node, "type" | "loc">) {
      const container = node as ListNode;
      const statements = container.body ?? container.consequent ?? [];
      let run: Rule.Node[] = [];

      for (const statement of statements) {
        const lastInRun = run[run.length - 1];
        const joinsRun = statement.type in operationKinds;
        const continuesRun = lastInRun !== undefined && !hasBlankLineBetween(lastInRun, statement);

        if (!joinsRun) {
          reportWall(run);
          run = [];
        } else if (continuesRun) {
          run.push(statement);
        } else {
          reportWall(run);
          run = [statement];
        }
      }

      reportWall(run);
    }

    return {
      Program: check,
      BlockStatement: check,
      StaticBlock: check,
      SwitchCase: check,
      TSModuleBlock: check,
    };
  },
};

export default rule;
