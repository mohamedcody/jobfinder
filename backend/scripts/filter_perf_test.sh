#!/usr/bin/env bash
set -euo pipefail

BASE_BACKEND="${BASE_BACKEND:-http://localhost:8080}"
BASE_FRONTEND="${BASE_FRONTEND:-http://localhost:3000}"
TOKEN="${TOKEN:-}"
LOOPS="${LOOPS:-30}"

auth_header=()
if [[ -n "$TOKEN" ]]; then
  auth_header=(-H "Authorization: Bearer $TOKEN")
fi

call_status() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" "${auth_header[@]}" "$url"
}

call_json_count() {
  local url="$1"
  curl -sS "${auth_header[@]}" "$url" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(len(d.get("data", [])))'
}

echo "== Smoke: backend filter status =="
echo "backend /api/jobs/filter -> $(call_status "$BASE_BACKEND/api/jobs/filter?size=5")"
echo "backend /api/jobs        -> $(call_status "$BASE_BACKEND/api/jobs?size=5")"

echo "== Smoke: frontend proxy filter status =="
echo "frontend /api/jobs/filter -> $(call_status "$BASE_FRONTEND/api/jobs/filter?size=5")"

echo "== Functional checks (counts) =="
echo "title=react                      -> $(call_json_count "$BASE_BACKEND/api/jobs/filter?title=react&size=50")"
echo "location=remote                  -> $(call_json_count "$BASE_BACKEND/api/jobs/filter?location=remote&size=50")"
echo "employmentType=Full-time         -> $(call_json_count "$BASE_BACKEND/api/jobs/filter?employmentType=Full-time&size=50")"
echo "postedAfter=7daysAgo (dynamic)   -> $(call_json_count "$BASE_BACKEND/api/jobs/filter?postedAfter=$(date -I -d '7 days ago')&size=50")"
echo "combined react+remote+full-time  -> $(call_json_count "$BASE_BACKEND/api/jobs/filter?title=react&location=remote&employmentType=Full-time&size=50")"

echo "== Performance loop ($LOOPS requests) =="
success=0
for i in $(seq 1 "$LOOPS"); do
  status=$(call_status "$BASE_BACKEND/api/jobs/filter?title=react&location=cairo&size=10")
  if [[ "$status" == "200" ]]; then
    success=$((success + 1))
  fi
done

echo "successful_200=$success/$LOOPS"
if [[ "$success" -lt "$LOOPS" ]]; then
  echo "WARN: some requests were not 200. Check auth token and backend logs." >&2
  exit 1
fi

echo "OK: all loop requests returned 200"
