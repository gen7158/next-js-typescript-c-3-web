import type { Question, QuestionDifficulty } from '@/types/platform';
import { fullstackQuestions } from '@/data/fullstack-questions';

type Topic = {
  id: string;
  category: string;
  concept: string;
  correct: string;
  distractors: string[];
  code: string;
  output: string;
  errorCode: string;
  errorReason: string;
  fillCode: string;
  fillAnswer: string;
  examPoint: string;
  difficulty: QuestionDifficulty;
};

const topics: Topic[] = [
  { id: 'basic', category: 'TypeScript基礎', concept: 'TypeScriptの型検査が行われる主なタイミングは？', correct: 'コードの実行前', distractors: ['実行が終了した後', 'ブラウザを閉じた時', '変数を削除した時'], code: 'const language: string = "TypeScript";\nconsole.log(language);', output: 'TypeScript', errorCode: 'const score: number = "80";', errorReason: 'number型へstringを代入している', fillCode: 'const enabled: _____ = true;', fillAnswer: 'boolean', examPoint: '型検査とJavaScriptの実行を分けて考えます。', difficulty: 'basic' },
  { id: 'inference', category: '基本型', concept: 'const score = 80 から推論される型は？', correct: 'number', distractors: ['string', 'boolean', 'any'], code: 'const price = 120;\nconst count = 3;\nconsole.log(price * count);', output: '360', errorCode: 'let active: boolean = 1;', errorReason: 'boolean型へnumberを代入している', fillCode: 'const title: _____ = "学習記録";', fillAnswer: 'string', examPoint: '値の見た目ではなくリテラルの種類から型を判断します。', difficulty: 'basic' },
  { id: 'null', category: 'null・undefined', concept: 'nullとundefinedだけを代替値へ置き換える演算子は？', correct: '??', distractors: ['||', '&&', '==='], code: 'const name: string | undefined = undefined;\nconsole.log(name ?? "Guest");', output: 'Guest', errorCode: 'const name: string | undefined = undefined;\nconsole.log(name.toUpperCase());', errorReason: 'undefinedの可能性を確認していない', fillCode: 'const label = value _____ "未設定";', fillAnswer: '??', examPoint: '||と??が0や空文字をどう扱うか比較します。', difficulty: 'standard' },
  { id: 'function', category: '関数', concept: '値を返さない目的の関数に使う戻り値型は？', correct: 'void', distractors: ['null', 'never', 'unknown'], code: 'function double(value: number): number {\n  return value * 2;\n}\nconsole.log(double(7));', output: '14', errorCode: 'function getScore(): number {\n  return "90";\n}', errorReason: 'numberを返す宣言なのにstringを返している', fillCode: 'function add(a: number, b: number): _____ { return a + b; }', fillAnswer: 'number', examPoint: '引数型、戻り値型、実際のreturnを照合します。', difficulty: 'basic' },
  { id: 'array', category: '配列・タプル', concept: '文字列だけを持つ配列型として正しいものは？', correct: 'string[]', distractors: ['string', '[string]', 'Array'], code: 'const scores: number[] = [60, 75, 90];\nconsole.log(scores[1]);', output: '75', errorCode: 'const user: [string, number] = [20, "Mio"];', errorReason: 'タプルの位置ごとの型が逆になっている', fillCode: 'const points: _____ = [10, 20, 30];', fillAnswer: 'number[]', examPoint: '配列の添字は0から始まり、タプルは位置にも意味があります。', difficulty: 'basic' },
  { id: 'methods', category: '配列メソッド', concept: '各要素を変換した新しい配列を返すメソッドは？', correct: 'map', distractors: ['find', 'forEach', 'some'], code: 'const values = [1, 2, 3];\nconsole.log(values.map((value) => value * 2).join(","));', output: '2,4,6', errorCode: 'const result: number[] = [1, 2].forEach((value) => value * 2);', errorReason: 'forEachは新しい配列を返さない', fillCode: 'const passed = scores.____((score) => score >= 60);', fillAnswer: 'filter', examPoint: 'map、filter、find、forEachの戻り値を区別します。', difficulty: 'standard' },
  { id: 'interface', category: 'interface', concept: 'オブジェクトの形を拡張可能な形で定義するキーワードは？', correct: 'interface', distractors: ['const', 'enum only', 'function'], code: 'interface User { name: string; }\nconst user: User = { name: "Ren" };\nconsole.log(user.name);', output: 'Ren', errorCode: 'interface User { name: string; age: number; }\nconst user: User = { name: "Ren" };', errorReason: '必須プロパティageが不足している', fillCode: 'interface Config { theme____: string; }', fillAnswer: '?', examPoint: '必須・省略可能・readonlyプロパティを見分けます。', difficulty: 'standard' },
  { id: 'union', category: 'Union・型ガード', concept: 'stringまたはnumberを表す型は？', correct: 'string | number', distractors: ['string & number', '[string, number]', 'string + number'], code: 'function label(value: string | number) {\n  return typeof value === "number" ? value + 1 : value.toUpperCase();\n}\nconsole.log(label(9));', output: '10', errorCode: 'function upper(value: string | number) {\n  return value.toUpperCase();\n}', errorReason: 'stringへ絞り込む前にtoUpperCaseを呼んでいる', fillCode: 'if (_____ value === "string") { console.log(value.length); }', fillAnswer: 'typeof', examPoint: 'Union型は利用前に候補を絞り込みます。', difficulty: 'standard' },
  { id: 'unknown', category: 'unknown・any', concept: '外部から来る不明な値を安全に受け取る型は？', correct: 'unknown', distractors: ['any', 'never', 'void'], code: 'const value: unknown = "safe";\nif (typeof value === "string") console.log(value.length);', output: '4', errorCode: 'const value: unknown = "text";\nconsole.log(value.length);', errorReason: 'unknownは型確認前にプロパティへアクセスできない', fillCode: 'const response: _____ = await getData();', fillAnswer: 'unknown', examPoint: 'anyは検査を止め、unknownは検査を要求します。', difficulty: 'standard' },
  { id: 'generic', category: 'ジェネリクス', concept: '入力した型を戻り値まで保つ仕組みは？', correct: 'ジェネリクス', distractors: ['型アサーション', '名前空間', 'デコレーター'], code: 'function first<T>(items: T[]): T | undefined {\n  return items[0];\n}\nconsole.log(first(["A", "B"]));', output: 'A', errorCode: 'function first<T>(items: T[]): T {\n  return items[0];\n}', errorReason: '空配列ではundefinedになる可能性を戻り値型に含めていない', fillCode: 'function identity<_____>(value: T): T { return value; }', fillAnswer: 'T', examPoint: '型パラメータが入力と出力をどう結ぶか追います。', difficulty: 'advanced' },
  { id: 'utility', category: 'Utility Types', concept: '既存型から一部のキーだけを選ぶ型は？', correct: 'Pick', distractors: ['Partial', 'Omit', 'Record'], code: 'type User = { name: string; age: number };\ntype Preview = Pick<User, "name">;\nconst user: Preview = { name: "Aoi" };\nconsole.log(user.name);', output: 'Aoi', errorCode: 'type User = { name: string; age: number };\ntype Preview = Pick<User, "email">;', errorReason: 'Userに存在しないemailを選んでいる', fillCode: 'type Update = _____<User>;', fillAnswer: 'Partial', examPoint: 'Pickは選択、Omitは除外、Partialは任意化です。', difficulty: 'advanced' },
  { id: 'async', category: 'Promise・非同期', concept: 'async関数が返す型の基本形は？', correct: 'Promise<T>', distractors: ['T[]', 'void only', 'Async<T>'], code: 'async function load(): Promise<string> {\n  return "done";\n}\nload().then(console.log);', output: 'done', errorCode: 'async function load(): string {\n  return "done";\n}', errorReason: 'async関数の戻り値はPromiseになる', fillCode: 'const result = _____ loadData();', fillAnswer: 'await', examPoint: 'await後の値とPromiseそのものを混同しないようにします。', difficulty: 'advanced' },
  { id: 'class', category: 'クラス', concept: 'クラス外から直接触れないメンバーを表す修飾子は？', correct: 'private', distractors: ['public', 'export', 'readonly only'], code: 'class Counter {\n  private value = 0;\n  add() { return ++this.value; }\n}\nconsole.log(new Counter().add());', output: '1', errorCode: 'class User { private name = "Mio"; }\nconsole.log(new User().name);', errorReason: 'privateプロパティへクラス外からアクセスしている', fillCode: 'class User { constructor(_____ name: string) {} }', fillAnswer: 'public', examPoint: 'アクセス範囲と値の変更可否は別の概念です。', difficulty: 'standard' },
  { id: 'module', category: 'モジュール', concept: '型だけを読み込む構文は？', correct: 'import type', distractors: ['import value', 'require type', 'include'], code: 'type Formatter = (value: number) => string;\nconst format: Formatter = (value) => `${value}点`;\nconsole.log(format(88));', output: '88点', errorCode: 'import { Missing } from "./types";', errorReason: '対象ファイルからMissingがexportされていない', fillCode: '_____ type { User } from "./types";', fillAnswer: 'import', examPoint: '型だけの依存と実行時に必要な値を区別します。', difficulty: 'standard' },
  { id: 'dom', category: 'DOM・Web', concept: 'querySelectorの戻り値に含まれる可能性がある型は？', correct: 'null', distractors: ['never', 'void', 'symbol'], code: 'const element: HTMLDivElement | null = null;\nconsole.log(element?.textContent ?? "none");', output: 'none', errorCode: 'const button = document.querySelector("button");\nbutton.addEventListener("click", () => {});', errorReason: 'buttonがnullの可能性を確認していない', fillCode: 'document.querySelector<_____>("#save");', fillAnswer: 'HTMLButtonElement', examPoint: 'DOM取得は失敗する可能性があるためnull確認が必要です。', difficulty: 'advanced' },
  { id: 'utility-partial', category: 'Utility Types', concept: 'すべてのプロパティを省略可能にするUtility Typeは？', correct: 'Partial<T>', distractors: ['Required<T>', 'Readonly<T>', 'Omit<T, K>'], code: 'interface User { id: number; name: string; email: string; }\ntype UserPatch = Partial<User>;\nconst patch: UserPatch = { name: "Riki" };\nconsole.log(patch);', output: '{ name: "Riki" }', errorCode: 'const patch: Required<User> = { id: 1 };', errorReason: 'Required は全プロパティ必須なのに name/email を渡していない', fillCode: 'const patch: _____<User> = {};', fillAnswer: 'Partial', examPoint: 'Partial/Required/Pick/Omit の挙動を整理します。', difficulty: 'standard' },
  { id: 'async-await-promise', category: '非同期', concept: 'await の戻り値の型を保証する仕組みは？', correct: 'Promise<T>', distractors: ['Observable<T>', 'Iterable<T>', 'AsyncIterator<T>'], code: 'async function getNumber(): Promise<number> {\n  return 42;\n}\n(async () => {\n  const n = await getNumber();\n  console.log(n);\n})();', output: '42', errorCode: 'const value = await getNumber();\nconsole.log(value.toUpperCase());', errorReason: 'number を受け取ったつもりで string 用メソッドを呼んでいる', fillCode: 'const value: _____<number> = await fetch();', fillAnswer: 'Promise', examPoint: 'await の結果型と Promise の関係を意識します。', difficulty: 'standard' },
  { id: 'narrowing-typeof', category: 'Narrowing', concept: 'ユニオン型を条件で絞り込むときに使う演算子は？', correct: 'typeof', distractors: ['instanceof only', 'as', 'in some'], code: 'function describe(value: string | number) {\n  if (typeof value === "string") return value.toUpperCase();\n  return value.toFixed(2);\n}\nconsole.log(describe(3.14159));', output: '3.14', errorCode: 'function describe(value: string | number) {\n  return value.toUpperCase();\n}', errorReason: 'string に絞り込まず toUpperCase を呼んでいる', fillCode: 'if (_____ value === "string") { console.log(value.length); }', fillAnswer: 'typeof', examPoint: 'typeof/in/instanceof での Narrowing を整理します。', difficulty: 'standard' },
  { id: 'module-import', category: 'モジュール', concept: '別ファイルから名前付きエクスポートを読む構文は？', correct: 'import { foo } from "./foo";', distractors: ['require("./foo").foo', 'use "./foo";', 'import "./foo" as foo;'], code: '// utils.ts\nexport const VERSION = "1.0.0";\n// main.ts\nimport { VERSION } from "./utils";\nconsole.log(VERSION);', output: '1.0.0', errorCode: 'const { VERSION } = require("./utils");', errorReason: 'CommonJS の require は ESM の import と挙動が違う', fillCode: 'import { greet } _____ "./util";', fillAnswer: 'from', examPoint: 'ESM の import/export 文法を整理します。', difficulty: 'basic' },
  { id: 'recursive-typescript', category: '再帰型', concept: '再帰的なデータ構造を表す型として適切なのは？', correct: 'type Node<T> = { value: T; next?: Node<T> };', distractors: ['type Node<T> = T[];', 'type Node<T> = Map<T, T>;', 'type Node<T> = never;'], code: 'type Node<T> = { value: T; next?: Node<T> };\nconst a: Node<number> = { value: 1 };\nconst b: Node<number> = { value: 2, next: a };\nconsole.log(b.next?.value);', output: '1', errorCode: 'type Node<T> = { value: T; next: Node<T> };', errorReason: 'next を optional にしていないため循環で無限型になる', fillCode: 'type Tree<T> = { value: T; children: _____<Tree<T>> };', fillAnswer: 'Array', examPoint: '自己参照型では optional や Array で循環を断ちます。', difficulty: 'advanced' },
];

const rotate = <T,>(items: T[], amount: number) => items.map((_, index) => items[(index + amount) % items.length]);

const typescriptQuestions: Question[] = topics.flatMap((topic, topicIndex) => {
  const conceptChoices = rotate([topic.correct, ...topic.distractors], topicIndex % 4);
  const conceptAnswer = conceptChoices.indexOf(topic.correct);
  const outputChoices = rotate([topic.output, '型エラー', 'undefined', '何も表示されない'], (topicIndex + 1) % 4);
  const errorChoices = rotate([topic.errorReason, '構文上の問題はない', 'セミコロンがない', 'console.logが必要'], (topicIndex + 2) % 4);
  const fillChoices = rotate([topic.fillAnswer, 'any', 'void', 'never'], (topicIndex + 3) % 4);
  return [
    {
      id: `${topic.id}-concept`,
      category: topic.category,
      difficulty: topic.difficulty,
      type: 'choice' as const,
      question: topic.concept,
      choices: conceptChoices,
      answer: conceptAnswer,
      explanation: `正解は「${topic.correct}」です。${topic.examPoint}`,
      wrongReasons: conceptChoices.map((choice) => choice === topic.correct ? '正しい選択肢です。' : `「${choice}」はこの目的を表しません。`),
      examPoint: topic.examPoint,
    },
    {
      id: `${topic.id}-output`,
      category: topic.category,
      difficulty: topic.difficulty,
      type: 'output' as const,
      question: '次のコードの実行結果を選んでください。',
      code: topic.code,
      choices: outputChoices,
      answer: outputChoices.indexOf(topic.output),
      explanation: `処理を上から追うと「${topic.output}」が表示されます。`,
      wrongReasons: outputChoices.map((choice) => choice === topic.output ? '正しい実行結果です。' : `このコードでは「${choice}」にはなりません。`),
      examPoint: topic.examPoint,
    },
    {
      id: `${topic.id}-reading`,
      category: topic.category,
      difficulty: topic.difficulty,
      type: 'reading' as const,
      question: '次のコードでTypeScriptが指摘する主な理由はどれですか？',
      code: topic.errorCode,
      choices: errorChoices,
      answer: errorChoices.indexOf(topic.errorReason),
      explanation: topic.errorReason,
      wrongReasons: errorChoices.map((choice) => choice === topic.errorReason ? 'この説明が型エラーの原因です。' : `「${choice}」は主原因ではありません。`),
      examPoint: topic.examPoint,
    },
    {
      id: `${topic.id}-fill`,
      category: topic.category,
      difficulty: topic.difficulty,
      type: 'fill' as const,
      question: '空欄へ入る最も適切な語を選んでください。',
      code: topic.fillCode,
      choices: fillChoices,
      answer: fillChoices.indexOf(topic.fillAnswer),
      explanation: `空欄には「${topic.fillAnswer}」が入ります。`,
      wrongReasons: fillChoices.map((choice) => choice === topic.fillAnswer ? '構文と目的に合っています。' : `「${choice}」では期待する型になりません。`),
      examPoint: topic.examPoint,
    },
    {
      id: `${topic.id}-true-false`,
      category: topic.category,
      difficulty: topic.difficulty,
      type: 'trueFalse' as const,
      question: `「${topic.examPoint}」この説明は正しいですか？`,
      choices: ['正しい', '誤り'],
      answer: 0,
      explanation: topic.examPoint,
      wrongReasons: ['説明どおりで正しいです。', 'この説明はTypeScriptの基本ルールに沿っています。'],
      examPoint: topic.examPoint,
    },
  ];
});

export const questions: Question[] = [...typescriptQuestions, ...fullstackQuestions];

export const questionCategories = [...new Set(questions.map((question) => question.category))];
