import { NextResponse } from 'next/server';
import ts from 'typescript';

export const runtime = 'nodejs';

type InferredType = {
  name: string;
  type: string;
  line: number;
};

const globalsFileName = 'learning-globals.d.ts';
const learningGlobals = `
declare const console: {
  log: (...values: unknown[]) => void;
  error: (...values: unknown[]) => void;
  warn: (...values: unknown[]) => void;
};
`;

function diagnosticText(diagnostic: ts.Diagnostic) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (!diagnostic.file || diagnostic.start === undefined) return message;
  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `main.ts:${position.line + 1}:${position.character + 1} - ${message}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { code?: unknown };
    const code = typeof body.code === 'string' ? body.code : '';
    if (!code.trim()) return NextResponse.json({ error: '実行するコードが空です。' }, { status: 400 });
    if (code.length > 40_000) return NextResponse.json({ error: 'コードが長すぎます。' }, { status: 400 });

    const fileName = 'main.ts';
    const options: ts.CompilerOptions = {
      strict: true,
      noImplicitAny: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      lib: ['lib.es2022.d.ts'],
      skipLibCheck: true,
    };
    const defaultHost = ts.createCompilerHost(options, true);
    const sourceFile = ts.createSourceFile(fileName, code, options.target ?? ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    const globalsSourceFile = ts.createSourceFile(globalsFileName, learningGlobals, options.target ?? ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
    let javascript = '';
    const host: ts.CompilerHost = {
      ...defaultHost,
      fileExists: (name) => name === fileName || name === globalsFileName || defaultHost.fileExists(name),
      readFile: (name) => {
        if (name === fileName) return code;
        if (name === globalsFileName) return learningGlobals;
        return defaultHost.readFile(name);
      },
      getSourceFile: (name, languageVersion, onError, shouldCreateNewSourceFile) => {
        if (name === fileName) return sourceFile;
        if (name === globalsFileName) return globalsSourceFile;
        return defaultHost.getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);
      },
      writeFile: (name, text) => {
        if (name.endsWith('.js')) javascript = text;
      },
    };
    const program = ts.createProgram([fileName, globalsFileName], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program)
      .filter((diagnostic) => !diagnostic.file || diagnostic.file.fileName === fileName)
      .map(diagnosticText);
    const checker = program.getTypeChecker();
    const inferredTypes: InferredType[] = [];

    const collect = (node: ts.Node) => {
      if (inferredTypes.length >= 20) return;
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const type = checker.getTypeAtLocation(node.name);
        const line = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile)).line + 1;
        inferredTypes.push({ name: node.name.text, type: checker.typeToString(type), line });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const signature = checker.getSignatureFromDeclaration(node);
        const returnType = signature ? checker.getReturnTypeOfSignature(signature) : checker.getTypeAtLocation(node);
        const line = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile)).line + 1;
        inferredTypes.push({ name: `${node.name.text}()`, type: checker.typeToString(returnType), line });
      }
      ts.forEachChild(node, collect);
    };
    collect(sourceFile);

    if (!diagnostics.length) program.emit();
    return NextResponse.json({
      diagnostics,
      inferredTypes,
      javascript,
      typecheckPassed: diagnostics.length === 0,
    });
  } catch {
    return NextResponse.json({ error: 'TypeScriptの型検査を実行できませんでした。' }, { status: 500 });
  }
}
