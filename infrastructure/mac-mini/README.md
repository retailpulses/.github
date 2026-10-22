# Mac mini Runtime Registry

Canonical inventory for rp-macmini-01. This registry documents registered application runtimes and their operational contract; it is not a live monitoring service.

- `runtime-inventory.yaml`: version-controlled registry of known runtime identities, execution modes, code paths and state references.
- `runtime-inventory-snapshot.md`: timestamped read-only observed evidence and unresolved gaps.

## Maintenance
- Update the registry when a runtime is introduced, deployed, relocated, disabled or retired.
- Record actual checkout commit SHA and executable path after verification; never infer from directory names.
- Mark unverified details UNKNOWN. Loaded LaunchAgent does not prove a successful run.
- Runtime discovery must remain read-only: do not restart, disable, clean up, or modify jobs as part of inventory.
- GitHub stores no tokens, credentials, environment variable values or private configuration contents.
- Production runtime code changes require explicit deployment/activation; Git pull in a development checkout is not deployment.
- A running Python process and its checkout are distinct: verify process command, code path, scheduler and state independently.
- Avoid per-runtime tracking issues unless there is a concrete defect to fix.

## Scope
macOS LaunchAgents and LaunchDaemons, cron, long-running services, scheduled Python jobs, supporting proxies, and relevant GitHub Actions runners. Excludes ordinary interactive IDE/browser processes unless part of a registered production workflow.

## Refresh
On rp-macmini-01 inspect `launchctl list`, `crontab -l`, `ps`, `lsof`, relevant plist files, Git checkout status/HEAD, and recent execution logs. Update the snapshot with timestamp and evidence; reconcile against registry. Do not publish secret-bearing command lines or environment variables.
