#!/usr/bin/env bash
# ELBTRONIKA — Git Tag Cleanup Script
# Run this AFTER the final main merge to clean up non-monotonic tags.
# WARNING: Do NOT run before all feature branches are merged into main.
# Author: Codex 5.3 / Kimi K-2.6 | Date: 2026-04-30

set -euo pipefail

echo "=== ELBTRONIKA Git Tag Cleanup ==="
echo "Current tags:"
git tag --list | sort -V

echo ""
echo "Step 1: Create annotated tags with phase context..."

# Map each existing lightweight tag to an annotated tag with context.
# Note: SHA references must be updated to actual commits on main after merge.
# The commands below assume the tags already point to the correct SHAs.

tag_annotate() {
  local old_tag="$1"
  local new_tag="$2"
  local msg="$3"
  local sha
  sha=$(git rev-list -n1 "$old_tag" 2>/dev/null || true)
  if [ -n "$sha" ]; then
    git tag -a "$new_tag" "$sha" -m "$msg"
    echo "  ✓ $old_tag → $new_tag ($msg)"
  else
    echo "  ✗ $old_tag not found, skipping"
  fi
}

tag_annotate "v0.1.0" "v0.1.0-phase-1"   "Phase 1: Repo & Tooling"
tag_annotate "v0.2.0" "v0.2.0-phase-2"   "Phase 2: Design System"
tag_annotate "v0.3.0" "v0.3.0-phase-3"   "Phase 3: Infrastructure"
tag_annotate "v0.4.0" "v0.4.0-phase-4"   "Phase 4: Auth & Roles"
tag_annotate "v0.5.0" "v0.5.0-phase-5"   "Phase 5: Content Model"
tag_annotate "v0.6.0" "v0.6.0-phase-6"   "Phase 6: Classic Mode Shop"
tag_annotate "v0.7.0" "v0.7.0-phase-7"   "Phase 7: Immersive 3D"
tag_annotate "v0.8.0" "v0.8.0-phase-8"   "Phase 8: Spatial Audio"
tag_annotate "v0.9.0" "v0.9.0-phase-9"   "Phase 9: Mode Transitions"
tag_annotate "v0.10.0" "v0.10.0-phase-12" "Phase 12: Edge & Performance"
tag_annotate "v0.11.0" "v0.11.0-phase-13" "Phase 13: Compliance"
tag_annotate "v0.12.0" "v0.12.0-phase-10" "Phase 10: Stripe Connect"

echo ""
echo "Step 2: Delete old lightweight tags (DANGER — review list first!)"
echo "Uncomment the lines below after verifying annotated tags are correct."
# for t in v0.1.0 v0.2.0 v0.3.0 v0.4.0 v0.5.0 v0.6.0 v0.7.0 v0.8.0 v0.9.0 v0.10.0 v0.11.0 v0.12.0; do
#   git tag -d "$t"
# done

echo ""
echo "Step 3: Set canonical v1.0.0 on main HEAD (after merge)"
echo "Uncomment after final main merge:"
# git tag -a v1.0.0 main -m "ELBTRONIKA v1.0.0 — Pitch-Ready + Trust-Hardened"

echo ""
echo "Done. Review annotated tags with: git tag -n1"
