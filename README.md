# 学習サイト開発ガイド

[![CI](https://github.com/gen7158/next-js-typescript-c-3-web/actions/workflows/ci.yml/badge.svg)](https://github.com/gen7158/next-js-typescript-c-3-web/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel)

C言語3級パスラボ（Next.js 16 + TypeScript）と、TypeScript版パスラボ（フルスタック＋基礎）を1リポジトリで管理するモノレポです。

- **C言語版**: [next-js-typescript-c-3-web.vercel.app](https://next-js-typescript-c-3-web.vercel.app)
- **TypeScript版**: [ts-pass-lab.vercel.app](https://ts-pass-lab.vercel.app)

正本ディレクトリ、検証方法、Vercel デプロイ手順、CI 設計の詳細は
[PROJECT_GUIDE.md](./PROJECT_GUIDE.md) を参照してください。

## リポジトリ構成

```text
next-js-typescript-c-3-web/
├── app/                # C言語版 Next.js App Router
├── components/         # C言語版 共通コンポーネント
├── data/               # 30 講座（基礎 24 + 発展 6）のデータ
├── lib/                # C言語版 ライブラリ
├── store/              # C言語版 学習状態管理
├── types/              # 共通型
├── ts-pass-lab/        # TypeScript版 Next.js App Router（サブプロジェクト）
│   ├── src/app/        # ルーティング
│   ├── src/components/ # AIチューター、コードエディタ等
│   ├── src/data/       # 39 講座（基礎 + フルスタック + 発展）
│   └── src/app/api/    # 9 種の API ルート
├── .github/workflows/  # GitHub Actions CI
└── .github/dependabot.yml
```

## ローカル起動

```bash
# C言語版
npm install
npm run dev          # http://localhost:3000

# TypeScript版
cd ts-pass-lab
npm install
npm run dev          # http://localhost:3000
```

## 品質チェック（typecheck / lint / build）

両プロジェクトで同じコマンドが使えます。

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run build        # next build
```

## Vercel デプロイ

```bash
# C言語版
cd /Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web
vercel deploy --prod --yes \
  --token $VERCEL_TOKEN \
  --scope rikishin1101-6295s-projects

# TypeScript版（プロジェクトの Root Directory が ts-pass-lab のため、サブパス内から）
cd ts-pass-lab
vercel deploy --prod --yes \
  --token $VERCEL_TOKEN \
  --scope rikishin1101-6295s-projects
```

## CI / Dependabot

- **CI**: `.github/workflows/ci.yml`
  - main ブランチへの push / PR で C言語版と TypeScript版の両方を typecheck + lint + build
  - 同じブランチへの再 push は進行中ジョブを自動キャンセル（`concurrency.cancel-in-progress: true`）
- **Dependabot**: `.github/dependabot.yml`
  - 週次（月曜 09:00 JST）で `npm` 依存関係と GitHub Actions を更新
  - `npm` 更新は C言語版・TypeScript版それぞれ別 PR

## 環境変数

Vercel Dashboard → `ts-pass-lab` → Settings → Environment Variables で `GEMINI_API_KEY` を Production に設定してください。CI では未使用、本番のみで参照されます。
