# 学習サイト開発ガイド

[![CI](https://github.com/gen7158/next-js-typescript-c-3-web/actions/workflows/ci.yml/badge.svg)](https://github.com/gen7158/next-js-typescript-c-3-web/actions/workflows/ci.yml)
[![Deploy to Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgen7158%2Fnext-js-typescript-c-3-web)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

C言語3級パスラボ（Next.js 16 + TypeScript）と、TypeScript版パスラボ（フルスタック＋基礎）を1リポジトリで管理するモノレポです。

- **C言語版**: https://next-js-typescript-c-3-web.vercel.app
- **TypeScript版**: https://ts-pass-lab.vercel.app

> 📘 詳細は [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) を参照

## 🚀 Vercel デプロイ

このリポジトリを **そのまま自分の Vercel アカウントにデプロイ** できます:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgen7158%2Fnext-js-typescript-c-3-web&env=GEMINI_API_KEY&envDescription=Gemini%20API%20key%20from%20https%3A%2F%2Faistudio.google.com%2Fapikey&envLink=https%3A%2F%2Faistudio.google.com%2Fapikey&project-name=pass-lab&root-directory=ts-pass-lab)

または、フォーク後 **GitHub 連携 + Vercel Dashboard** で2プロジェクトに分割デプロイ:

| プロジェクト | Root Directory | 用途 |
|---|---|---|
| `next-js-typescript-c-3-web` | `.` | C言語版 → `next-js-typescript-c-3-web.vercel.app` |
| `ts-pass-lab-v2` | `ts-pass-lab` | TypeScript版 → `ts-pass-lab.vercel.app` |

2026年6月15日時点で、両VercelプロジェクトはこのGitHubリポジトリへ接続済みです。
`main`へのpushでCIと本番デプロイが自動実行されます。

## 🔧 環境変数の簡単設定

Vercel Dashboard を開かずに、ターミナルから環境変数を一括登録できます。

`ts-pass-lab/.env.example` を編集後、以下のコマンドを実行:

```bash
export VERCEL_TOKEN="vcp_..."  # https://vercel.com/account/tokens で発行
export GEMINI_API_KEY="AIza..."  # https://aistudio.google.com/apikey で発行

# 1) Vercel 側の環境変数を設定
./scripts/setup-vercel.sh

# 2) GitHub Actions 用の Secrets を設定
export GITHUB_TOKEN="ghp_..."  # repo + workflow スコープ付き PAT
./scripts/setup-github-secrets.sh
```

これで **main への push 時に自動デプロイ + 自動 CI チェック** が走ります。

## 📦 リポジトリ構成

```text
next-js-typescript-c-3-web/
├── app/                # C言語版 Next.js App Router
├── components/         # C言語版 共通コンポーネント
├── data/               # 56 講座（基礎 30 + 発展 26）
├── lib/                # C言語版 ライブラリ
├── store/              # C言語版 学習状態管理
├── types/              # 共通型
├── ts-pass-lab/        # TypeScript版 Next.js App Router
│   ├── src/app/        # ルーティング
│   ├── src/components/ # AIチューター、コードエディタ等
│   ├── src/data/       # 約 50 講座（基礎 41 + フルスタック + 発展）
│   └── src/app/api/    # 9 種の API ルート
├── scripts/
│   ├── setup-vercel.sh        # Vercel 環境変数一括登録
│   └── setup-github-secrets.sh # GitHub Secrets 一括登録
├── .github/workflows/
│   ├── ci.yml                  # typecheck / lint / build
│   ├── dependabot-auto-merge.yml  # Dependabot PR 自動マージ
│   └── deploy-vercel.yml       # main push で Vercel デプロイ
├── vercel.json
├── .env.example
├── README.md
└── PROJECT_GUIDE.md
```

## 💻 ローカル起動

```bash
# C言語版
npm install
npm run dev          # http://localhost:3000

# TypeScript版
cd ts-pass-lab
npm install
npm run dev          # http://localhost:3000
```

## ✅ 品質チェック

両プロジェクトで同じコマンドが使えます:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run build        # next build
```

## 🤖 CI / Dependabot

- **CI**: `.github/workflows/ci.yml`
  - C言語版と TypeScript版を並列に typecheck + lint + build
- **Dependabot**: `.github/dependabot.yml`
  - 週次で `npm` 依存関係と GitHub Actions を更新
- **Dependabot ルール**: メジャー更新は除外（CI互換性問題回避）。マイナー/パッチのみ自動PR化
- **Dependabot 自動マージ**: `.github/workflows/dependabot-auto-merge.yml`
  - patch/minor リリースは CI 通過後に自動マージ
- **Vercel GitHub 連携**: ✅ 有効化済み
  - `main` ブランチへの push で Vercel が自動で本番デプロイを実行
  - TypeScript版は `Root Directory = ts-pass-lab`、Build/Install は Vercel 標準設定
- **手動デプロイ（フォールバック）**: `.github/workflows/deploy-vercel.yml`
  - Vercel GitHub 連携が落ちていた場合のフォールバック手段
  - GitHub の Actions タブから手動実行で Vercel CLI 経由でデプロイ

## 📚 ドキュメント

- [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) — プロジェクトの正本ディレクトリ、修正方針、検証手順、Vercel デプロイの詳細
- [ts-pass-lab/.env.example](./ts-pass-lab/.env.example) — TypeScript版で必要な環境変数のテンプレート
- [scripts/setup-vercel.sh](./scripts/setup-vercel.sh) — Vercel 環境変数のセットアップスクリプト
- [scripts/setup-github-secrets.sh](./scripts/setup-github-secrets.sh) — GitHub Secrets のセットアップスクリプト
