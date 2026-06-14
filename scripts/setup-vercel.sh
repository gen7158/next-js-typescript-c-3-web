#!/usr/bin/env bash
# =============================================================================
# Vercel 環境変数セットアップスクリプト
#
# 概要:
#   .env.example を読み取り、定義された環境変数を Vercel に非対話で一括設定する
#   引数 or 環境変数 or stdin or 対話プロンプトで値を受け取る
#
# 使い方:
#   # トークン指定 + 各キーを引数で
#   VERCEL_TOKEN=vcp_xxx \
#     GEMINI_API_KEY=AIza... \
#     ./scripts/setup-vercel.sh
#
#   # トークンを export 済みで、対話で値を入力
#   ./scripts/setup-vercel.sh
#
#   # stdin から JSON で複数キー
#   echo '{"GEMINI_API_KEY":"AIza..."}' | VERCEL_TOKEN=vcp_xxx ./scripts/setup-vercel.sh --stdin-json
#
# 必要:
#   - vercel CLI (brew install vercel or npm i -g vercel)
#   - VERCEL_TOKEN: https://vercel.com/account/tokens (Full Access)
# =============================================================================
set -euo pipefail

# ---------- 設定 ----------
SCOPE="rikishin1101-6295s-projects"
TS_PROJECT_ID="prj_Sdlp5s1AsRsQHTvwkMeNsE5e54w5"
C_PROJECT_ID="prj_AYeTag5S9OU5oLPeavnm3GX0KpYH"
REPO="gen7158/next-js-typescript-c-3-web"
ROOT="/Users/shinjourikunozomi/Documents/Codex/2026-06-11/next-js-typescript-c-3-web"
TS_DIR="$ROOT/ts-pass-lab"

# ---------- 前提 ----------
command -v vercel >/dev/null 2>&1 || { echo "❌ vercel CLI がありません"; exit 1; }
[[ -n "${VERCEL_TOKEN:-}" ]] || { echo "❌ VERCEL_TOKEN 未設定"; exit 1; }

echo "📦 Vercel 環境変数セットアップ"
echo "  Scope: $SCOPE"
echo "  Repository: $REPO"
echo ""

# ---------- 値の取得 ----------
declare -A VALUES
USE_STDIN_JSON=0
[[ "${1:-}" == "--stdin-json" ]] && USE_STDIN_JSON=1

if (( USE_STDIN_JSON )) && [[ ! -t 0 ]]; then
  while IFS= read -r line; do
    key=$(echo "$line" | sed -nE 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p')
    val=$(echo "$line" | sed -nE 's/^[A-Z_][A-Z0-9_]*=(.*)$/\1/p')
    if [[ -n "$key" ]]; then
      VALUES["$key"]="$val"
    fi
  done
else
  # .env.example を読み取って必要なキーを把握
  KEY_FILE="$TS_DIR/.env.example"
  [[ -f "$KEY_FILE" ]] || { echo "❌ $KEY_FILE がありません"; exit 1; }
  
  echo "📋 $KEY_FILE から必要なキーを読み取り中..."
  while IFS= read -r line; do
    # 空行・コメント行をスキップ
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    key=$(echo "$line" | sed -nE 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p')
    if [[ -n "$key" ]]; then
      # 既に環境変数で指定されているか
      if [[ -n "${!key:-}" ]]; then
        VALUES["$key"]="${!key}"
        echo "  ✓ $key (環境変数から)"
      else
        # 対話で聞く
        if [[ -t 0 ]]; then
          read -r -s -p "  → $key の値を入力: " val
          echo
        else
          read -r val
        fi
        VALUES["$key"]="$val"
      fi
    fi
  done < "$KEY_FILE"
fi

# ---------- Vercel に登録 ----------
echo ""
echo "🚀 Vercel に環境変数を設定中..."

for key in "${!VALUES[@]}"; do
  value="${VALUES[$key]}"
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
