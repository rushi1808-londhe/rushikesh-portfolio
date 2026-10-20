#!/usr/bin/env bash
# Writes .env for docker compose from an AWS Secrets Manager secret.
# The secret must be a JSON object of KEY: value pairs (every variable from .env.example).
# Requires: aws CLI v2, jq, and an EC2 instance role allowing secretsmanager:GetSecretValue on the secret.
#
# Usage: ./deploy/fetch-env.sh [secret-id] [output-file]
set -euo pipefail

SECRET_ID="${1:-prod/portfolio}"
OUT="${2:-.env}"
REGION="${AWS_REGION:-ap-south-1}"

umask 077
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

# Values are single-quoted so compose doesn't interpolate a "$" inside a generated secret.
aws secretsmanager get-secret-value \
  --region "$REGION" --secret-id "$SECRET_ID" \
  --query SecretString --output text \
| jq -r '([39] | implode) as $q
         | to_entries[]
         | (.value | tostring) as $v
         | if ($v | contains($q)) then error("single quote in \(.key) is not supported") else . end
         | "\(.key)=\($q)\($v)\($q)"' > "$tmp"

mv "$tmp" "$OUT"
echo "Wrote $(wc -l < "$OUT" | tr -d ' ') variables to $OUT"
