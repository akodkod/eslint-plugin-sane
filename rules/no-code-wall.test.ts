import { RuleTester } from "eslint";
import * as parser from "@typescript-eslint/parser";
import rule from "./no-code-wall";

const ruleTester = new RuleTester({
  languageOptions: { parser },
});

const wall = `function run(settings, variables, services) {
  const missing = settings.keys.filter(key => !variables[key]?.trim());
  if (missing.length === 0) return;
  const service = settings.services.map(name => services.find(item => item.name === name)).find(Boolean);
  if (!service) throw new Error("Missing service");
  const source = service.name;
  const sourceVariables = parse(source);
}`;

const split = `function run(settings, variables, services) {
  const missing = settings.keys.filter(key => !variables[key]?.trim());
  if (missing.length === 0) return;

  const service = settings.services.map(name => services.find(item => item.name === name)).find(Boolean);
  if (!service) throw new Error("Missing service");

  const source = service.name;
  const sourceVariables = parse(source);
}`;

ruleTester.run("no-code-wall", rule, {
  valid: [
    split,
    // One kind of operation is easy to scan
    "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;",
    // Fewer than five lines
    "const a = 1;\nif (a) run();\nfor (const b of list) run(b);\nreturn a;",
    // Imports and function declarations end a run
    "import a from \"a\";\nconst b = a;\nfunction run() {}\nif (b) run();\nconst c = 1;\nconst d = 2;",
    // A standalone comment does not split a run, but a blank line does
    "const a = 1;\nif (a) run();\n\n// Next block\nconst b = 2;\nfor (const c of b) run(c);\nreturn b;",
    { code: wall, options: [{ minLines: 8 }] },
    { code: wall, options: [{ minKinds: 3 }] },
  ],
  invalid: [
    {
      code: wall,
      errors: [{ messageId: "codeWall", line: 2, endLine: 7, data: { lineCount: "6", kindCount: "2", kinds: "declaration, branch" } }],
    },
    {
      code: "switch (value) {\n  case 1:\n    const a = 1;\n    if (a) run();\n    for (const b of list) run(b);\n    run(a);\n    return a;\n}",
      errors: [{ messageId: "codeWall", data: { lineCount: "5", kindCount: "5", kinds: "declaration, branch, loop, expression, jump" } }],
    },
    {
      code: "const a = 1;\nif (a) run();\nfor (const b of list) run(b);\nrun(a);\nthrow a;",
      errors: [{ messageId: "codeWall" }],
    },
    {
      code: `${wall}\n${wall}`,
      errors: [{ messageId: "codeWall" }, { messageId: "codeWall" }],
    },
  ],
});
