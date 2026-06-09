# Pull Request

<!--
  Retailpulses central PR template.
  Fill in all sections. Delete sections that are genuinely N/A.
  Leave a brief "N/A — <reason>" rather than deleting when the
  section is not applicable but the reason isn't obvious.
-->

## Summary

<!-- One paragraph: what this does and why. -->

## User / Operator Impact

<!--
  Who is affected and how?
  - End users / customers?
  - Internal operators?
  - Other developers?
  - Downstream automation / n8n / Workers?
-->

## Technical Changes

<!--
  What changed technically? Link key files.
  - Architecture changes
  - New dependencies
  - API changes
  - Schema changes
  - Config changes
-->

## Validation Performed

<!--
  What did you actually run?
  - [ ] Type check / lint
  - [ ] Unit tests
  - [ ] Integration test
  - [ ] Manual smoke test
  - [ ] Dry-run against production data
  - [ ] CSV encoding check (if Japanese marketplace)
-->

## Deployment Impact

<!--
  Does this change deployment behavior?
  - Change deploy path / command?
  - New secrets needed?
  - New environment variables?
  - Runtime version change?
  - Scheduled job change?
  - New health check endpoint?
-->

## Rollback Notes

<!--
  How do we undo this if something goes wrong?
  - Revert this PR?
  - Run a specific rollback command?
  - Manual intervention required?
-->

## Cloudflare Dependency Impact

<!-- REQUIRED — do not skip. -->

**Does this PR add or deepen Cloudflare-specific dependency?** [Yes / No]

If **Yes**, explain:
- **Why Cloudflare is needed:**
- **Is the dependency isolated behind an adapter?** [Yes / No / Partial]
  - If Partial: which parts are coupled?
- **What is the VPS / Node / Python alternative?**
- **Migration impact if we need to leave Cloudflare:**
  - [ ] Trivial (adapter swap)
  - [ ] Moderate (rewrite one module)
  - [ ] Hard (rewrite core logic)
  - [ ] Very hard (architecture redesign)

## Screenshots / Logs

<!-- If relevant. Delete otherwise. -->

## Agent Notes

<!--
  If any part of this PR was generated or reviewed by an AI agent,
  note which agent and what it did.
  Example: "Claude Code generated the CSV validator. Reviewed by human."
-->
