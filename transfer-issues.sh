#!/usr/bin/env bash
#
# Move all issues (any state) from GaymeBar-Inc/now-hiring to JasonToups/Payload-Portfolio
#
# NOTE: These two repos have different owners (org vs personal account), so
# GitHub's native `gh issue transfer` will likely be rejected. This script
# tries the real transfer first for each issue, and if that fails, falls
# back to recreating the issue in the target repo (title, body, labels)
# and closing the original with a comment linking to the new one.
#
# Requirements:
#   - GitHub CLI (`gh`) installed and authenticated: gh auth login
#   - `jq` installed
#   - Write access to now-hiring, admin/write access to Payload-Portfolio
#
# Usage:
#   chmod +x transfer-issues.sh
#   ./transfer-issues.sh            # live run
#   DRY_RUN=1 ./transfer-issues.sh  # preview only, no changes made

set -euo pipefail

SOURCE_REPO="GaymeBar-Inc/now-hiring"
TARGET_REPO="JasonToups/Payload-Portfolio"
PROJECT_OWNER="JasonToups"
PROJECT_NUMBER=10
DRY_RUN="${DRY_RUN:-0}"
SLEEP_SECONDS=2

echo "Source: $SOURCE_REPO"
echo "Target: $TARGET_REPO"
echo "Project: $PROJECT_OWNER / #$PROJECT_NUMBER"
echo "Dry run: $DRY_RUN"
echo

# Names of the Status field and its options on your project board.
# Override via env vars if your board uses different labels, e.g.:
#   PROJECT_STATUS_FIELD_NAME="Status" OPEN_STATUS_OPTION_NAME="Backlog" CLOSED_STATUS_OPTION_NAME="Done" ./transfer-issues.sh
PROJECT_STATUS_FIELD_NAME="${PROJECT_STATUS_FIELD_NAME:-Status}"
OPEN_STATUS_OPTION_NAME="${OPEN_STATUS_OPTION_NAME:-Backlog}"
CLOSED_STATUS_OPTION_NAME="${CLOSED_STATUS_OPTION_NAME:-Done}"

PROJECT_ID=""
STATUS_FIELD_ID=""
OPEN_OPTION_ID=""
CLOSED_OPTION_ID=""

if [ "$DRY_RUN" != "1" ]; then
  echo "Looking up project fields for status mapping..."
  project_view_json=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json)
  PROJECT_ID=$(echo "$project_view_json" | jq -r '.id')

  field_list_json=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json)
  STATUS_FIELD_ID=$(echo "$field_list_json" | jq -r --arg name "$PROJECT_STATUS_FIELD_NAME" \
    '.fields[] | select(.name==$name) | .id')
  OPEN_OPTION_ID=$(echo "$field_list_json" | jq -r --arg name "$PROJECT_STATUS_FIELD_NAME" --arg opt "$OPEN_STATUS_OPTION_NAME" \
    '.fields[] | select(.name==$name) | .options[]? | select(.name==$opt) | .id')
  CLOSED_OPTION_ID=$(echo "$field_list_json" | jq -r --arg name "$PROJECT_STATUS_FIELD_NAME" --arg opt "$CLOSED_STATUS_OPTION_NAME" \
    '.fields[] | select(.name==$name) | .options[]? | select(.name==$opt) | .id')

  if [ -z "$STATUS_FIELD_ID" ]; then
    echo "  WARNING: no '$PROJECT_STATUS_FIELD_NAME' field found on project #$PROJECT_NUMBER. Status will not be set."
  else
    echo "  Status field found. open -> '$OPEN_STATUS_OPTION_NAME', closed -> '$CLOSED_STATUS_OPTION_NAME'"
    [ -z "$OPEN_OPTION_ID" ] && echo "  WARNING: no option named '$OPEN_STATUS_OPTION_NAME' on that field."
    [ -z "$CLOSED_OPTION_ID" ] && echo "  WARNING: no option named '$CLOSED_STATUS_OPTION_NAME' on that field."
  fi
  echo
fi

# Adds an issue URL to the target project and sets its Status to match open/closed state.
# Non-fatal if any step fails.
add_to_project() {
  local issue_url="$1"
  local issue_state="$2"   # OPEN or CLOSED

  local add_json
  if ! add_json=$(gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$issue_url" --format json 2>/tmp/project_add_out); then
    echo "  WARNING: could not add to project -> $(cat /tmp/project_add_out)"
    echo "  (make sure you've run: gh auth refresh -s project)"
    return
  fi

  local item_id
  item_id=$(echo "$add_json" | jq -r '.id')
  echo "  added to project #$PROJECT_NUMBER (item $item_id)"

  if [ -z "$STATUS_FIELD_ID" ]; then
    return
  fi

  local target_option_id="$OPEN_OPTION_ID"
  [ "$issue_state" = "CLOSED" ] && target_option_id="$CLOSED_OPTION_ID"

  if [ -z "$target_option_id" ]; then
    echo "  WARNING: no matching status option for state '$issue_state', leaving default status"
    return
  fi

  if gh project item-edit --id "$item_id" --project-id "$PROJECT_ID" \
      --field-id "$STATUS_FIELD_ID" --single-select-option-id "$target_option_id" \
      >/tmp/project_status_out 2>&1; then
    echo "  status set to match '$issue_state'"
  else
    echo "  WARNING: could not set status -> $(cat /tmp/project_status_out)"
  fi
}

# --- Step 1: sync labels so nothing gets dropped on transfer/recreate ---
echo "Syncing labels from source to target..."
gh label list --repo "$SOURCE_REPO" --limit 1000 --json name,color,description | \
  jq -c '.[]' | while read -r label; do
    name=$(echo "$label" | jq -r '.name')
    color=$(echo "$label" | jq -r '.color')
    description=$(echo "$label" | jq -r '.description // ""')

    if [ "$DRY_RUN" = "1" ]; then
      echo "  [dry-run] would ensure label '$name' exists in $TARGET_REPO"
    else
      gh label create "$name" --color "$color" --description "$description" \
        --repo "$TARGET_REPO" --force >/dev/null 2>&1 || true
      echo "  ensured label: $name"
    fi
done
echo

# --- Step 2: get every issue (open + closed) from the source repo ---
echo "Fetching issue list from $SOURCE_REPO..."
issues=$(gh issue list --state all --repo "$SOURCE_REPO" --limit 1000 --json number,title,body,labels,state)
count=$(echo "$issues" | jq 'length')
echo "Found $count issues."
echo

# --- Step 3: process each issue ---
echo "$issues" | jq -c '.[]' | while read -r issue; do
  number=$(echo "$issue" | jq -r '.number')
  title=$(echo "$issue" | jq -r '.title')
  body=$(echo "$issue" | jq -r '.body // ""')
  state=$(echo "$issue" | jq -r '.state')
  labels=$(echo "$issue" | jq -r '[.labels[].name] | join(",")')

  echo "Issue #$number: $title [$state]"

  if [ "$DRY_RUN" = "1" ]; then
    echo "  [dry-run] would attempt native transfer, fall back to recreate if rejected, add to project #$PROJECT_NUMBER, and set status to match '$state'"
    continue
  fi

  # Try the real transfer first
  if gh issue transfer "$number" "https://github.com/$TARGET_REPO" --repo "$SOURCE_REPO" >/tmp/transfer_out 2>&1; then
    transferred_url=$(cat /tmp/transfer_out | tail -n1)
    echo "  transferred natively -> $transferred_url"
    add_to_project "$transferred_url" "$state"
  else
    echo "  native transfer rejected (expected: different owners). Recreating instead..."

    label_args=()
    if [ -n "$labels" ]; then
      label_args=(--label "$labels")
    fi

    source_issue_url="https://github.com/$SOURCE_REPO/issues/$number"

    new_url=$(gh issue create \
      --repo "$TARGET_REPO" \
      --title "$title" \
      --body "$body

---
_Originally reported as [#$number]($source_issue_url) in $SOURCE_REPO._" \
      "${label_args[@]}")

    echo "  created: $new_url"
    add_to_project "$new_url" "$state"

    if [ "$state" = "CLOSED" ]; then
      gh issue close "$new_url" --comment "Closed on original issue in $SOURCE_REPO." >/dev/null 2>&1 || true
      echo "  closed new issue to match original state"
    fi

    if [ "$state" = "CLOSED" ]; then
      gh issue close "$number" --repo "$SOURCE_REPO" \
        --comment "Moved to $new_url" >/dev/null 2>&1 || true
    else
      gh issue comment "$number" --repo "$SOURCE_REPO" \
        --body "Moved to $new_url" >/dev/null 2>&1 || true
      gh issue close "$number" --repo "$SOURCE_REPO" >/dev/null 2>&1 || true
    fi
    echo "  closed original #$number with link to new issue"
  fi

  sleep "$SLEEP_SECONDS"
  echo
done

echo "Done."