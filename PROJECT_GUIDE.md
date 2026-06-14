# プロジェクト運用・修正・デプロイガイド

最終更新: 2026年6月14日（GitHub 移行 + CI/Dependabot 追加）

## 1. プロジェクトの正本

今後は、次の2ディレクトリを編集対象の正本とします。

### C言語3級対策サイト

```text
/Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web
```

- Vercelプロジェクト: `next-js-typescript-c-3-web`
- 本番URL: https://next-js-typescript-c-3-web.vercel.app
- Next.js 15 / TypeScript / Tailwind CSS / Zustand

### TypeScript・Webフルスタック学習サイト

```text
/Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web/ts-pass-lab
```

- Vercelプロジェクト: `ts-pass-lab`
- 本番URL: https://ts-pass-lab.vercel.app
- Next.js 16 / TypeScript / CSS Modules

### 旧TypeScriptディレクトリ

```text
/Users/shinjourikunozomi/.gemini/antigravity/scratch/car-news-app
```

このディレクトリは過去の作業場所です。現在は`ts-pass-lab`と同じ内容へ同期されていますが、
今後は直接編集せず、必要な場合だけ正本から同期します。

```bash
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .vercel \
  /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web/ts-pass-lab/ \
  /Users/shinjourikunozomi/.gemini/antigravity/scratch/car-news-app/
```

`--delete`を使うため、同期元と同期先を逆にしないでください。

## 2. 主なディレクトリ

### C言語版

```text
app/                  ページとAPI Route
  api/c-run/          Cコードのコンパイル・実行API
  learn/              3級対策講座
  advanced/           合格後の発展講座
components/lesson/    講義、演習、コードエディタ
components/gemini/    Gemini AIチューター
data/                 講義・問題データ
lib/                  Gemini、採点、進捗、localStorage処理
store/                Zustandストア
types/                型定義
```

### TypeScript版

```text
ts-pass-lab/src/
  app/                       画面本体とAPI Route
    api/typescript-run/      TypeScript型検査API
  components/CodeWorkspace  講義コード演習
  components/AITutorDrawer  AIチャット
  data/                      講義・問題・制作課題
  lib/learning-storage       学習履歴と講義コード保存
  types/                     型定義
```

## 2.5 GitHub / Vercel 自動デプロイ

このプロジェクトは1つの GitHub リポジトリで C言語版と TypeScript版を両方管理するモノレポ構成です。

```text
GitHub: gen7158/next-js-typescript-c-3-web
  ├─ main ブランチへ push
  │   ├─ GitHub Actions: typecheck + lint + build（C言語版・TypeScript版 並列）
  │   └─ Vercel: 自動デプロイ
  │       ├─ next-js-typescript-c-3-web プロジェクト（Root Directory = .）
  │       └─ ts-pass-lab プロジェクト（Root Directory = ts-pass-lab）
```

### GitHub Actions

`.github/workflows/ci.yml` で typecheck / lint / build を自動実行します。`workflow` スコープ付き Personal Access Token を初回 push に使用。

### Dependabot

`.github/dependabot.yml` で週次の依存関係更新と GitHub Actions 更新を自動 PR 化します。

### Vercel 設定

- `next-js-typescript-c-3-web` プロジェクト: Root Directory = `.`
- `ts-pass-lab` プロジェクト: Root Directory = `ts-pass-lab`
- 環境変数: `GEMINI_API_KEY` を `ts-pass-lab` の Production に設定

GitHub 連携を有効化するには Vercel Dashboard でプロジェクト → Settings → Git → Connect Git Repository から `gen7158/next-js-typescript-c-3-web` を選択してください。

## 3. 今後の修正方針


### 共通方針

1. C版とTypeScript版で共通する学習UXは、原則として両方へ反映します。
2. 問題・講義データはコンポーネントへ直書きせず、`data/`へ追加します。
3. 型を先に定義し、`any`による回避は行いません。
4. 既存のlocalStorageキーとデータ形式は、理由なく変更しません。
5. データ形式を変更するときは、古いデータを読み込める移行処理を追加します。
6. APIキー、トークン、個人情報をソースコードやGitへ保存しません。
7. PC表示だけでなく、幅390px前後のスマートフォン表示も確認します。

### 講義・演習

- `starterCode`には完成コードを置かず、学習者が書く部分を残します。
- 書き方ガイドは答えそのものではなく、STEP形式の作業順序にします。
- 課題成功はコード文字列の部分一致だけで判定しません。
- 実際の型検査、コンパイル結果、標準出力、期待値を使って判定します。
- 成功したコードは講義ID単位で自動保存します。
- 完了後は次の講義へ進める導線を必ず表示します。
- 再受講時は「保存コードで再開」「リセットして再受講」を選択可能にします。
- コード編集後は、以前の成功判定を無効にして再実行を求めます。

### C言語実行

- ブラウザから直接コンパイラを呼ばず、`app/api/c-run/route.ts`を経由します。
- Wandboxの隔離実行環境で`gcc`を使用します。
- コンパイル出力、標準出力、標準エラー、終了コードを画面へ返します。
- 外部実行サービスにはタイムアウトと入力サイズ制限を付けます。
- `expectedOutput`は説明文ではなく、実際の標準出力と比較できる値にします。
- 入力が必要な課題は`stdin`も講義データへ定義します。

### TypeScript実行

- `src/app/api/typescript-run/route.ts`でTypeScript Compiler APIを使います。
- 型エラーの行・列、変数と関数の推論型を返します。
- 型検査後のJavaScriptはブラウザのWeb Worker内でタイムアウト付き実行を行います。
- `next.config.ts`の`outputFileTracingIncludes`を削除しないでください。
  Vercel上でTypeScript標準ライブラリ定義を読み込むために必要です。

### Gemini

- モデル名を固定せず、利用可能モデル一覧から選択できる設計を維持します。
- APIキーは現在、個人利用向けとしてブラウザのlocalStorageへ保存します。
- 公開サービスとして第三者へ広く提供する場合は、APIキーをサーバー側へ移します。
- AI回答はMarkdownとして描画し、コードブロックや見出しを読みやすくします。
- `Enter`は改行、`Command/Ctrl + Enter`は送信のまま維持します。

## 4. localStorage

学習履歴はブラウザと本番ドメインごとに保存されます。

### C言語版

- 主な状態: `c-pass-lab-state-v1`
- Gemini APIキーと選択モデルは`lib/gemini.ts`で管理
- 講義コードはZustandの`lessonCodeRecords`へ保存

### TypeScript版

- 学習データ: `ts-pass-lab-learning-data-v2`
- 講義コード: `ts-pass-lab-lesson-code-v1`
- 完了講義: `ts-pass-lab-progress`
- AI講座: `ts-pass-lab-custom-lessons`
- AIチャット履歴とGemini設定もlocalStorageへ保存

別ドメインや別ブラウザへ移動すると自動では共有されません。必要に応じてバックアップ機能を使います。

## 5. ローカル起動

両方を同時起動する場合はポートを分けます。

### C言語版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web
npm install
npm run dev -- -p 3000
```

URL: http://localhost:3000

### TypeScript版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web/ts-pass-lab
npm install
npm run dev -- -p 3001
```

URL: http://localhost:3001

## 6. 修正後の検証

### C言語版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web
npm run typecheck
npm run lint
npm run build
```

### TypeScript版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web/ts-pass-lab
npm run typecheck
npm run lint
npm run build
```

`.next/types`に`d 2.ts`のような重複生成ファイルが残り型エラーになる場合だけ、
生成物を削除して再検証します。

```bash
rm -rf .next
npm run typecheck
npm run build
```

ソースコードやlocalStorageは削除されません。

### 画面確認

- 講義を開ける
- エディタへコードを入力できる
- 実行結果とエラーがターミナル形式で表示される
- 正しい出力で課題成功になる
- 間違った出力で不合格になる
- TypeScriptの推論型が表示される
- コードが再読込後も残る
- 完了後に次の講義へ進める
- 再受講時にコード保持・リセットを選べる
- AIチャットのMarkdownと送信ショートカットが動く
- スマートフォン幅で横にはみ出さない

## 7. Vercelへデプロイ

両ディレクトリはすでに正しいVercelプロジェクトへリンクされています。

### C言語版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web
npm run typecheck
npm run lint
npm run build
npx vercel --prod --yes
```

本番エイリアス:

```text
https://next-js-typescript-c-3-web.vercel.app
```

### TypeScript版

```bash
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web/ts-pass-lab
npm run typecheck
npm run lint
npm run build
npx vercel --prod --yes
```

本番エイリアス:

```text
https://ts-pass-lab.vercel.app
```

### 初回リンクが必要な場合

`.vercel/project.json`がない新しいコピーでは、先にリンクします。

```bash
npx vercel link
```

選択するプロジェクト:

- C言語版: `next-js-typescript-c-3-web`
- TypeScript版: `ts-pass-lab`

## 8. デプロイ後の確認

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  https://next-js-typescript-c-3-web.vercel.app/learn/c-basics

curl -sS -o /dev/null -w '%{http_code}\n' \
  https://ts-pass-lab.vercel.app/
```

CコンパイルAPI:

```bash
curl -sS https://next-js-typescript-c-3-web.vercel.app/api/c-run \
  -H 'content-type: application/json' \
  --data '{"code":"#include <stdio.h>\nint main(void){printf(\"6\\n\");return 0;}","expectedOutput":"6","stdin":""}'
```

TypeScript型推論API:

```bash
curl -sS https://ts-pass-lab.vercel.app/api/typescript-run \
  -H 'content-type: application/json' \
  --data '{"code":"const score = 72; const passed = score >= 60; console.log(passed);"}'
```

確認する値:

- C: `"passed": true`
- TypeScript: `"typecheckPassed": true`
- TypeScript推論型: `score: 72`、`passed: boolean`

## 9. 障害時

### Vercelのビルドログ

```bash
npx vercel inspect <デプロイURL> --logs
```

### 同じデプロイを再実行

```bash
npx vercel redeploy <デプロイURL>
```

### 直前の正常版へ戻す

Vercel DashboardのDeploymentsから正常だったデプロイを選び、Promote to Productionを実行します。

### C実行だけ失敗する

- Wandboxの通信障害やレート制限を確認
- `/api/c-run`のHTTPステータスとレスポンスを確認
- 無限ループ、コードサイズ、標準入力不足を確認

### TypeScript型検査だけ失敗する

- `typescript`が`dependencies`に存在するか確認
- `next.config.ts`の`outputFileTracingIncludes`を確認
- `/api/typescript-run`を直接呼び、診断内容を確認

## 10. 推奨する次の改善

1. CとTypeScriptの課題へ複数の非公開テストケースを追加する
2. localStorageデータへバージョン移行関数を追加する
3. C実行サービス停止時の代替実行先または再試行を用意する
4. E2Eテストで「受講、実行、保存、次へ、再受講」を自動確認する
5. 正本をGitリポジトリ化し、変更履歴と本番ロールバックを簡単にする

