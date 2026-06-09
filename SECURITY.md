# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in any Retailpulses repository, please report it privately.

**Do not open a public issue.**

Instead, use GitHub's private vulnerability reporting:

→ [Report a vulnerability](https://github.com/retailpulses/.github/security/advisories/new)

Or contact the repository owner directly.

## What to Include

When reporting, please include:

- Affected repository and component
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

## Scope

This policy covers:

- API key or credential exposure
- Insecure authentication or authorization
- Data leakage (customer data, order data, PII)
- Injection vulnerabilities (SQL, command, etc.)
- Misconfigured access controls
- Secrets accidentally committed to version control

## Out of Scope

- Issues already documented in public issues or PRs
- Vulnerabilities in third-party dependencies that are already publicly known
- Theoretical vulnerabilities without a demonstrated impact

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix timeline:** Depends on severity. Critical issues are prioritized.

## Security Best Practices for Contributors

1. **Never commit secrets.** Use `.env` files (gitignored) and GitHub Actions Secrets.
2. **Never log credentials.** Mask secrets in logs and summaries.
3. **Review PRs for credential exposure.** Check diffs for API keys, tokens, passwords.
4. **Keep dependencies updated.** Run `npm audit` / `pip audit` regularly.
5. **Use minimal permissions.** GitHub Actions workflows should request only needed permissions.
6. **Validate inputs.** All user-supplied data should be validated before processing.
7. **Prefer prepared statements.** Never concatenate user input into SQL queries.

## Credential Safety

Retailpulses uses a local `master_credentials.md` file as a credential lookup index. This file:

- Records credential names, purposes, and storage locations
- Never contains full secret values
- Must never be committed to git
- Is covered by `.gitignore`

If you discover that `master_credentials.md` or any `.env` file has been committed, treat it as a security incident and report it immediately.

## Sensitive Business Data

In addition to standard PII and credentials, Retailpulses repos handle ecommerce-specific sensitive data:

- **Customer data:** names, addresses, phone numbers, email addresses
- **Order data:** order IDs, marketplace transaction IDs, purchase history
- **Inquiry/ticket contents:** customer messages, complaint details, resolution notes
- **Supplier cost data:** wholesale prices, supplier margins, cost formulas
- **Pricing data:** price calculation logic, margin formulas, discount strategies
- **Marketplace credentials:** API keys, tokens, seller IDs for Mercari, Rakuten, Amazon Japan
- **Inventory data:** stock levels, restock triggers, warehouse locations
- **Operational data:** Baserow table IDs, n8n webhook URLs, VPS IP addresses (internal use only)

Agents and contributors must treat all of the above as confidential. Never expose these in public repos, logs, summaries, or issue comments.

## Recognized Runtimes & Attack Surfaces

| Runtime | Key Security Concerns |
|---------|----------------------|
| Cloudflare Workers | Wrangler secrets, route exposure, Worker-to-Worker bindings |
| VPS Node services | SSH access, open ports, systemd unit privileges |
| Python scripts | `.env` file exposure, API token handling |
| Static frontends | CORS configuration, API key exposure in client code |
| GitHub Actions | Workflow injection, secret exposure in logs, overly broad permissions |
| n8n | Webhook authentication, credential node security |
| Baserow | API token scope, table-level permissions |
