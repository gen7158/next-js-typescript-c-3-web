#!/usr/bin/env bash
# =============================================================================
# GitHub リポジトリの Secrets と Variables をセットアップ（POSIX 互換）
#
# 使い方:
#   GITHUB_TOKEN=ghp_xxx VERCEL_TOKEN=vcp_xxx \
#     ./scripts/setup-github-secrets.sh
#
# 必要:
#   - GITHUB_TOKEN: repo / workflow スコープ付き PAT
#   - VERCEL_TOKEN: Vercel Dashboard で発行（Full Access）
# =============================================================================
set -euo pipefail

REPO="gen7158/next-js-typescript-c-3-web"

[[ -n "${GITHUB_TOKEN:-}" ]] || { echo "❌ GITHUB_TOKEN 未設定"; exit 1; }
[[ -n "${VERCEL_TOKEN:-}" ]] || { echo "❌ VERCEL_TOKEN 未設定"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "❌ gh CLI が必要です"; exit 1; }

echo "📦 GitHub Secrets セットアップ"
echo "  Repository: $REPO"
echo ""

# gh secret set を順次実行
set_secret() {
  local name="$1"
  local value="$2"
  echo "  → $name を登録中..."
  echo "$value" | gh secret set "$name" --repo "$REPO" 2>&1 | tail -2 | sed 's/^/    /'
}

set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN"
set_secret "VERCEL_ORG_ID" "team_TGWG4KMuj86ADOJ3NlPUaJN7"
set_secret "VERCEL_PROJECT_ID_C" "prj_AYeTag5S9OU5oLPeavnm3GX0KpYH"
set_secret "VERCEL_PROJECT_ID_TS" "prj_Sdlp5s1AsRsQHTvwkMeNsE5e54w5"
set_secret "VERCEL_SCOPE" "rikishin1101-6295s-projects"

echo ""
echo "✅ 完了"
echo ""
echo "次のステップ:"
echo "  1) ./scripts/setup-vercel.sh を実行して Vercel 側の環境変数を設定"
echo "  2) main ブランチへ push すると GitHub Actions が自動デプロイ"
