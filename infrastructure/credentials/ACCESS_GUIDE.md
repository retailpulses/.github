# Credential Access Guide

This guide documents the observed Mac mini credential registry and its existing
local import/access paths. It does not authorize reading an arbitrary secret,
creating a credential, rotating one, or changing production configuration.

## Where

The verified registry is `credential_registry.credentials` in database
`postgres` inside Docker container `supabase_db_local-supabase-smoke` on
`rp-macmini-01`.

Read-only verification on 2026-10-25 observed PostgreSQL 17.6, 67 rows, columns
`id`, `name`, `value`, `project`, `environment`, `description`, `source_file`,
and `updated_at`, with a unique constraint on `(name, project, environment)`.
Row-level security is enabled and there are no row policies. The registry
owner (`postgres`) has access; `anon`, `authenticated`, and `service_role` have
neither schema usage nor table SELECT privileges. The credential values were
not queried. This is a local ordinary PostgreSQL table, not Vault.

The container publishes local Postgres port 54322, but network/firewall policy
and access from MacBook or cloud agents have not been verified. The only
documented and verified route is an authorized operator on the Mac mini using
Docker `exec`. Do not expose this database, add a tunnel, or copy the registry
to another host as a workaround. Remote reachability is UNKNOWN and is not an
approved access path in this guide.

## Lookup metadata

Run on the Mac mini. This command returns matching metadata only, never the
`value` column:

```sh
docker exec -i supabase_db_local-supabase-smoke psql -U postgres -d postgres \
  -v ON_ERROR_STOP=1 -P pager=off -c \
  "SELECT name, project, environment, description, source_file, updated_at FROM credential_registry.credentials WHERE name = 'CREDENTIAL_NAME' AND project = 'PROJECT' AND environment = 'ENVIRONMENT';"
```

Replace the three uppercase placeholders with the exact lookup key. Treat
`description` and `source_file` as local metadata; do not paste them into public
issues if they reveal internal information. A zero-row result means that exact
key was not found; it does not prove the credential is absent under another
project/environment or in a product-owned runtime store.

## Authorized value access

Only after the task owner authorizes access to a specific credential for a
specific purpose, an authorized Mac mini database operator may use the local
interactive `psql` session below. This is the existing access method; it is not
a new CLI or a remote service.

```sh
docker exec -it supabase_db_local-supabase-smoke psql -U postgres -d postgres
```

At the `psql` prompt, bind the exact metadata key and select only that row's
value:

```sql
\prompt 'Credential name: ' credential_name
\prompt 'Project: ' credential_project
\prompt 'Environment: ' credential_environment
SELECT value
FROM credential_registry.credentials
WHERE name = :'credential_name'
  AND project = :'credential_project'
  AND environment = :'credential_environment';
```

The result is sensitive. Keep it in the authorized local terminal and transfer
it only through the task's already authorized destination. Do not use shell
tracing, command-line arguments, SQL files, clipboard history, screenshots,
logs, issue comments, chat, or CI output to carry a value. Exit with `\q` when
finished. If there is no explicit authorization for the value or destination,
stop after metadata lookup and report the missing authorization as the blocker.

## Register or update

The existing local import tool is
`/Users/agent/work/local-supabase-smoke/scripts/import_credentials.py`. It
parses one selected Markdown, TXT, or `.env` source file, sends values to local
`psql` on stdin, and prints counts only. It assigns environment `dev` and marks
the environment unverified; it does not validate credential validity. Existing
rows with the same `(name, project, environment)` are upserted. With
`--replace-source`, rows whose `source_file` equals the input basename are
deleted and replaced in the same transaction.

For an authorized registration/update on the Mac mini:

1. Confirm the exact local source file and the authorization to import/update
   its credentials. Never paste values into a command or this repository.
2. Create a fresh owner-only local backup before changing rows:

   ```sh
  umask 077
  backup_dir=/Users/agent/work/local-supabase-smoke/backups/credential-registry
  mkdir -p "$backup_dir"
  chmod 700 "$backup_dir"
   backup_file="$backup_dir/pre-credential-registry-$(date +%Y%m%d%H%M%S).dump"
   docker exec supabase_db_local-supabase-smoke pg_dump -U postgres -d postgres -Fc > "$backup_file"
   chmod 600 "$backup_file"
   pg_restore -l "$backup_file" >/dev/null
   ```

3. Parse without applying. This prints entry counts only:

   ```sh
   python3 /Users/agent/work/local-supabase-smoke/scripts/import_credentials.py \
     /absolute/path/to/authorized-source.md
   ```

4. Review the counts and confirm whether the source should replace its prior
   rows. Import without replacement to upsert parsed keys:

   ```sh
   python3 /Users/agent/work/local-supabase-smoke/scripts/import_credentials.py \
     /absolute/path/to/authorized-source.md --apply
   ```

   To replace all prior rows from the same source basename atomically, use
   `--apply --replace-source` instead. Use the same source file for future
   updates so its basename remains stable. Do not run this against an
   unreviewed or guessed source.

5. Verify only counts and metadata, never values. Keep source files and backups
   owner-only and outside Git; preserve the prior backup until recovery is no
   longer needed.

Credential creation or rotation requires explicit authorization. The importer
only registers values supplied in an already authorized source file; it does
not create, renew, or test upstream credentials. The previously used
`master_credentials.md` is not present/readable at its historical path on the
observed host, so a future import must identify a currently authorized source.

## Failure recovery

- **No metadata match:** check the exact project and environment. Then check
  only other authorized registries/runtime configuration. If still absent,
  report the credential name, purpose, expected owner, and whether creation is
  needed; do not infer or fabricate a value.
- **Permission denied:** stop. Do not broaden grants, disable RLS, use a client
  API role, or switch to another identity. Request the appropriate local
  database operator authorization.
- **Container/database unavailable:** report the container and error class to
  the Mac mini operator. Do not start/recreate the stack or restore a backup as
  part of lookup.
- **Expired or rotated upstream value:** record the failed service check
  without including the value; ask the credential owner to authorize rotation
  through the service's approved path, then register the replacement using the
  authorized source file procedure above.
- **MacBook/cloud agent cannot reach it:** this access path is not verified for
  remote hosts. Do not tunnel, publish a port, or copy secrets. Run the
  authorized lookup on the Mac mini or document remote access as a separate
  approved infrastructure task.

## Recovery and rollback

The registry repository documents the rollback SQL at
`/Users/agent/work/local-supabase-smoke/supabase/rollback/credential_registry.sql`
and a prior owner-only custom-format backup. Neither was executed for this
guide. A rollback drops registry data; use it only with explicit authorization
and after preserving the current database. Restore only into an isolated,
stopped local instance after confirming the target and preserving its current
volume. Do not use rollback or restore to troubleshoot an ordinary lookup.
