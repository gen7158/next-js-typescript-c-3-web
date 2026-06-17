import type { BeforeMount } from '@monaco-editor/react';

const LEARNING_GLOBALS_URI = 'ts:learning-globals.d.ts';

const LEARNING_GLOBALS = `
declare const console: {
  log: (...values: unknown[]) => void;
  error: (...values: unknown[]) => void;
  warn: (...values: unknown[]) => void;
};
`;

let configured = false;

export const configureLearningTypeScript: BeforeMount = (monaco) => {
  if (configured) return;
  configured = true;

  const options = {
    strict: true,
    noImplicitAny: true,
    noEmit: true,
    skipLibCheck: true,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    lib: ['es2022'],
    types: [],
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(options);
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(options);
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSyntaxValidation: false,
    noSemanticValidation: false,
  });
  monaco.languages.typescript.typescriptDefaults.addExtraLib(LEARNING_GLOBALS, LEARNING_GLOBALS_URI);
};
