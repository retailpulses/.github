# Mac mini Infrastructure Inventory

This directory maintains the canonical infrastructure registry for Mac mini execution runtimes and local data assets (database instances and database files). It does not document application data quality or business-rule verification.

## Files and counting

- `runtime-inventory.yaml`: canonical machine-readable registry of runtime identities, execution entrypoints, and local database assets.
- `runtime-inventory-snapshot.md`: timestamped read-only observations of registered runtime IDs and data-asset IDs, including running processes, database instance presence, and outstanding infrastructure checks.

The initial inventory contains **15 runtime entries**. The five listening services in the earlier snapshot were only a subset, not a different inventory. Database files are listed separately under `data_assets` and are **not counted as running services**.

## Rules

1. Update the registry when a runtime or local database asset is added, moved, deployed, disabled, or retired.
2. Keep transient PIDs, observed health and execution results in the snapshot, not in canonical runtime definitions.
3. Distinguish database instances, SQLite data files, and synchronization jobs.
4. Mark unverified paths, commits, status and backups as UNKNOWN rather than guessing.
5. Discover runtime state read-only; inventory does not authorize deployment, restarts or cleanup.
6. Never commit credentials, tokens, connection secrets, environment values or customer data.

## Refresh

On the Mac mini inspect launchctl, crontab, processes, listening ports, Git checkout HEADs and relevant execution logs. For databases, inspect engine/container identity, configured ports, volumes, lifecycle ownership, dependencies, and backup/restore arrangements without reading business data. Do not record product row counts, specific SKU prices, business reconciliation results, or application acceptance evidence here. Reconcile each observed runtime ID against YAML.

This is an initial partial inventory, not a complete health certification.
