# Credential Registry

The canonical source for local credential metadata and authorized values is the
Mac mini's private PostgreSQL registry described in
[ACCESS_GUIDE.md](ACCESS_GUIDE.md). It is an existing local Supabase database,
not a hosted service or a Vault deployment. GitHub contains only this procedure;
never put credential values or source files in this repository.

Start with the guide for lookup, access boundaries, registration, update, and
recovery. Product runtime configuration remains owned by each product.
