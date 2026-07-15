#!/usr/bin/env bash
# ============================================================
# auto-push.sh — Push automático a GitHub + Deploy a Vercel
# Uso: ./scripts/auto-push.sh "mensaje del commit" [fase]
#   fase: feat | fix | refactor | style | chore | docs | perf
#
# Requiere: GITHUB_TOKEN en entorno (o .env.local)
# ============================================================

set -euo pipefail

REPO_DIR="/home/z/my-project/academia-el-profe"
GITHUB_TOKEN="${GITHUB_TOKEN:-$(cat /home/z/.github-token 2>/dev/null || true)}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN no definida. Exportala o ponla en ~/.github-token"
  exit 1
fi

REMOTE_URL="https://${GITHUB_TOKEN}@github.com/academiaelprofeoficial/academia-el-profe.git"
PHASE="${2:-feat}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="${1:-Mejora general}"

cd "$REPO_DIR"

# Ensure remote is set
git remote set-url origin "$REMOTE_URL"

# Ensure branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ "$BRANCH" = "" ]; then
  BRANCH="main"
  git checkout -b main 2>/dev/null || true
fi

# Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
  echo "[${TIMESTAMP}] Sin cambios. Nada que commitear."
  exit 0
fi

# Stage all
git add -A

# Build commit message with phase tag
FORMATTED_MSG="[${PHASE}] ${COMMIT_MSG} (${TIMESTAMP})"

# Commit
git commit -m "$FORMATTED_MSG"

# Push
git push origin "$BRANCH" 2>&1

echo ""
echo "========================================="
echo " PUSH EXITOSO"
echo "========================================="
echo " Commit: ${FORMATTED_MSG}"
echo " Branch: ${BRANCH}"
echo " Deploy: Vercel se despliega automaticamente al push a GitHub."
echo "========================================="