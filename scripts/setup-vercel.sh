#!/usr/bin/env bash
# =============================================================================
# Vercel 環境変数セットアップスクリプト（POSIX 互換）
#
# 使い方:
#   # トークン + キーを環境変数で
#   VERCEL_TOKEN=vcp_xxx GEMINI_API_KEY=AIza... ./scripts/setup-vercel.sh
#
#   # トークンを export 済みで、対話でキー入力
#   ./scripts/setup-vercel.sh
#
#   # stdin から1行（KEY=VALUE形式）
#   echo "GEMINI_API_KEY=AIza..." | VERCEL_TOKEN=vcp_xxx ./scripts/setup-vercel.sh
#
# 必要:
#   - vercel CLI (brew install vercel or npm i -g vercel)
#   - VERCEL_TOKEN: https://vercel.com/account/tokens (Full Access)
# =============================================================================
set -euo pipefail

# ---------- 設定 ----------
SCOPE="rikishin1101-6295s-projects"
TS_PROJECT_ID="prj_Sdlp5s1AsRsQHTvwkMeNsE5e54w5"
ROOT="/Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web"
TS_DIR="$ROOT/ts-pass-lab"
REPO="gen7158/next-js-typescript-c-3-web"

# ---------- 前提 ----------
command -v vercel >/dev/null 2>&1 || { echo "❌ vercel CLI がありません"; exit 1; }
[[ -n "${VERCEL_TOKEN:-}" ]] || { echo "❌ VERCEL_TOKEN 未設定"; exit 1; }

echo "📦 Vercel 環境変数セットアップ"
echo "  Scope: $SCOPE"
echo "  Repository: $REPO"
echo ""

# ---------- 一時ファイルで値を受け取り ----------
TMPDIR_VALS=$(mktemp -d)
trap 'rm -rf "$TMPDIR_VALS"' EXIT

# .env.example を読み取って必要なキーを把握
KEY_FILE="$TS_DIR/.env.example"
[[ -f "$KEY_FILE" ]] || { echo "❌ $KEY_FILE がありません"; exit 1; }

echo "📋 $KEY_FILE から必要なキーを読み取り中..."

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  key=$(echo "$line" | sed -nE 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p')
  [[ -z "$key" ]] && continue
  
  if [[ -n "${!key:-}" ]]; then
    echo "  ✓ $key (環境変数から)"
    printf '%s' "${!key}" > "$TMPDIR_VALS/$key"
  elif [[ ! -t 0 ]]; then
    # stdin から1行読む（KEY=VALUE形式）
    read -r stdin_line
    stdin_key=$(echo "$stdin_line" | sed -nE 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p')
    stdin_val=$(echo "$stdin_line" | sed -nE 's/^[A-Z_][A-Z0-9_]*=(.*)$/\1/p')
    if [[ "$stdin_key" == "$key" ]]; then
      printf '%s' "$stdin_val" > "$TMPDIR_VALS/$key"
    fi
  elif [[ -t 0 ]]; then
    read -r -s -p "  → $key の値を入力: " val
    echo
    printf '%s' "$val" > "$TMPDIR_VALS/$key"
  fi
done < "$KEY_FILE"

# ---------- Vercel に登録 ----------
echo ""
echo "🚀 Vercel に環境変数を設定中..."

for f in "$TMPDIR_VALS"/*; do
  [[ -f "$f" ]] || continue
  key=$(basename "$f")
  value=$(cat "$f")
  if [[ -z "$value" || "$value" == *"your-"* ]]; then
    echo "  ⏭ $key: 値が未設定のためスキップ"
    continue
  fi
  echo "  → $key を ts-pass-lab Production に設定"
  vercel env add "$key" production \
    --token "$VERCEL_TOKEN" \
    --scope "$SCOPE" \
    --cwd "$TS_DIR" \
    --value "$value" \
    --yes \
    --force 2>&1 | tail -3 | sed 's/^/    /'
done

echo ""
echo "✅ 完了"
echo ""
echo "📌 次のステップ:"
echo "  1) Vercel Dashboard で GitHub 連携を有効化"
echo "     https://vercel.com/dashboard"
echo "     両プロジェクトとも Settings → Git → Connect → $REPO"
echo ""
echo "  2) または GitHub Actions の deploy-vercel.yml を使う"
echo "     このリポの Settings → Secrets → Actions → VERCEL_TOKEN を追加"
