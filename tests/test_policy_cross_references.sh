#!/usr/bin/env bash
# test_policy_cross_references.sh — verify cross-references between governance docs are valid

echo "--- Policy cross-reference integrity ---"

KIT_DOCS="$KIT_DIR/docs"

# Check that every file referenced in DATABASE_GOVERNANCE.md exists
echo "--- DATABASE_GOVERNANCE.md references ---"

if [[ -f "$KIT_DOCS/DATABASE_GOVERNANCE.md" ]]; then
  REFS=$(grep -oE '`?docs/(DATABASE_[A-Z_]+\.(yaml|md)|[0-9]+_.+\.md)`?' "$KIT_DOCS/DATABASE_GOVERNANCE.md" | sed "s/\`//g" | sort -u)

  for ref in $REFS; do
    # Extract just the filename from the ref
    fname=$(basename "$ref")
    # Look for it in the canonical docs
    if [[ -f "$KIT_DOCS/$fname" ]] || [[ -f "$KIT_DIR/$ref" ]]; then
      pass "Reference exists: $ref"
    else
      # Some refs are repo-local (docs/16_DATABASE_GOVERNANCE.local.md etc.)
      if echo "$ref" | grep -q 'local\.md'; then
        pass "Reference to repo-local file (expected): $ref"
      else
        warn "Reference may be stale: $ref"
      fi
    fi
  done
else
  fail "DATABASE_GOVERNANCE.md not found"
fi

# Check incident response references
echo ""
echo "--- DATABASE_INCIDENT_RESPONSE.md structure ---"

if [[ -f "$KIT_DOCS/DATABASE_INCIDENT_RESPONSE.md" ]]; then
  REQUIRED_SECTIONS=(
    "Incident Classification"
    "Resource-Exhaustion Triage"
    "Evidence Capture Before Mitigation"
    "Emergency Shutdown"
    "Compute Resize"
    "Recovery Validation"
    "Downgrade Gates"
    "Post-Incident"
  )

  for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "$section" "$KIT_DOCS/DATABASE_INCIDENT_RESPONSE.md"; then
      pass "Incident response has: $section"
    else
      fail "Incident response missing: $section"
    fi
  done

  # Must reference governance policy
  if grep -q 'DATABASE_GOVERNANCE.md' "$KIT_DOCS/DATABASE_INCIDENT_RESPONSE.md"; then
    pass "Incident response references DATABASE_GOVERNANCE.md"
  else
    fail "Incident response missing reference to DATABASE_GOVERNANCE.md"
  fi

  # Must reference workload registry
  if grep -q 'DATABASE_WORKLOADS' "$KIT_DOCS/DATABASE_INCIDENT_RESPONSE.md"; then
    pass "Incident response references DATABASE_WORKLOADS.yaml"
  else
    fail "Incident response missing reference to DATABASE_WORKLOADS.yaml"
  fi
else
  fail "DATABASE_INCIDENT_RESPONSE.md not found"
fi

# Check the three core governance files form a coherent set
echo ""
echo "--- Governance doc set coherence ---"

if grep -q 'Egress and Read-Amplification Control' "$KIT_DOCS/DATABASE_GOVERNANCE.md" && \
   grep -q 'response bytes' "$KIT_DOCS/DATABASE_INCIDENT_RESPONSE.md"; then
  pass "Policy and incident playbook cover egress attribution"
else
  fail "Egress attribution policy is incomplete"
fi
CORE_DOCS=(
  "DATABASE_GOVERNANCE.md"
  "DATABASE_OWNERSHIP.yaml"
  "DATABASE_ACCESS_POLICY.yaml"
  "DATABASE_CAPABILITIES.yaml"
  "DATABASE_WORKLOADS.yaml"
  "DATABASE_INCIDENT_RESPONSE.md"
)

for doc in "${CORE_DOCS[@]}"; do
  if [[ -f "$KIT_DOCS/$doc" ]]; then
    pass "$doc exists"
  else
    fail "$doc missing"
  fi
done

# Check the database workflow CI exists
echo ""
echo "--- CI workflow integrity ---"

CI_DIR="$KIT_DIR/.github/workflows"
CI_FILES=(
  "governance-checks.yml"
  "database-governance-checks.yml"
  "post-deploy-governance.yml"
)

for ci in "${CI_FILES[@]}"; do
  if [[ -f "$CI_DIR/$ci" ]]; then
    pass "$ci exists"
  else
    fail "$ci missing"
  fi
done

# Verify the central reusable workflow delegates to its checked-in implementation.
if [[ -f "$CI_DIR/database-governance-checks.yml" ]]; then
  for mode in blocking production-gate advisory; do
    if grep -q "database-governance-checks.sh $mode" "$CI_DIR/database-governance-checks.yml"; then
      pass "database workflow delegates $mode checks to central script"
    else
      fail "database workflow missing central $mode delegation"
    fi
  done
  if grep -q 'repository: retailpulses/.github' "$CI_DIR/database-governance-checks.yml"; then
    pass "database workflow checks out the central governance repository"
  else
    fail "database workflow does not check out the central governance repository"
  fi
  if grep -q 'required: true' "$CI_DIR/database-governance-checks.yml" && ! grep -q 'default: main' "$CI_DIR/database-governance-checks.yml" && grep -q 'governance_ref: __REF__' "$KIT_DIR/templates/github/workflows/database-governance-wrapper.yml"; then
    pass "database implementation is pinned to the wrapper commit SHA"
  else
    fail "database workflow must use the caller's immutable implementation SHA"
  fi
  if grep -qi 'project.*NOT secrets' "$CI_DIR/database-governance-checks.yml"; then
    pass "database workflow clarifies project references are not secrets"
  else
    fail "database workflow must clarify project references are not secrets"
  fi
  if grep -qi 'redact' "$CI_DIR/database-governance-checks.yml"; then
    pass "database workflow documents secret redaction"
  else
    fail "database workflow must document secret redaction"
  fi
fi

# Verify implemented database check functions and mode names.
echo ""
echo "--- Database governance check modes ---"
SCRIPT="$KIT_DIR/scripts/database-governance-checks.sh"
for check in check_migration_naming check_duplicate_timestamps_local check_migration_docs_impact check_secret_detection check_migration_header check_cross_domain_owner check_runtime_impact_declaration check_n_plus_one check_change_aware_write check_access_path check_run_health_independence; do
  if grep -q "$check" "$SCRIPT"; then pass "Database check implemented: $check"; else fail "Database check missing: $check"; fi
done
