# @local/dsh-zoho-mail

A DeepSeek Harness plugin that connects the agent to your Zoho Mail mailbox: list and search
messages, read full bodies, download attachments, send mail, and organize folders.

This package is vendored under `engineering/stacks/zoho-mail/plugin/` in the organization
`.github` repository. Install it from that path, not from a separate working copy, so the recorded
capability and the code stay together. Credentials and downloads stay inside the plugin directory
and are git-ignored.

## Tools

| Tool | Purpose |
| --- | --- |
| `zoho_mail_status` | Authorization and connection check; lists reachable accounts and folders. Start here. |
| `zoho_mail_folders` | Accounts plus folder ids, names, types, and paths. |
| `zoho_mail_list` | Messages in Inbox/Sent/Drafts/Trash/Spam/Archive or a custom folder, newest first, with unread filtering and pagination. |
| `zoho_mail_search` | Mailbox search with Zoho search syntax (`from:`, `subject:`, `has:attachment`, `newMails`, ...). |
| `zoho_mail_read` | One message: metadata, full HTML body, plain-text rendering, attachment list, optional raw headers. |
| `zoho_mail_attachment` | List attachments, or download one into `downloads/` with private permissions. |
| `zoho_mail_send` | Send a message (or reply with `replyToMessageId`), with local file attachments and a `dryRun` preview. |
| `zoho_mail_update` | Mark read/unread, archive, unarchive, spam, not-spam, move, soft delete, or expunge. |
| `zoho_mail_connect` | Exchange a Zoho grant code for a refresh token and store it (alternative to the CLI helper). |

## Setup

### 1. Create a Zoho API client

1. Open the Zoho API console for **your data center**:
   `com` → <https://api-console.zoho.com>, `eu` → <https://api-console.zoho.eu>,
   `in` → <https://api-console.zoho.in>, `com.au` → <https://api-console.zoho.com.au>,
   `jp` → <https://api-console.zoho.jp>, `ca` → <https://api-console.zoho.ca>,
   `com.cn` → <https://api-console.zoho.com.cn>.
2. **Add Client** → **Self Client** → copy the **Client ID** and **Client Secret**.
3. Open the client's **Generate Code** tab, enter this scope, choose a 10-minute duration, and create:

   ```
   ZohoMail.accounts.READ,ZohoMail.messages.ALL,ZohoMail.folders.ALL
   ```

4. Copy the one-time **grant code**.

### 2. Store the refresh token locally

Run the helper from the plugin folder. It prompts with hidden input, so the client secret and
grant code never appear in the chat or shell history:

```bash
cd engineering/stacks/zoho-mail/plugin
node scripts/zoho-auth.mjs --region=com
```

It writes `credentials/zoho.json` (mode `0600`) and verifies the mailbox immediately. Non-interactive
runs can pass `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_GRANT_CODE` in the environment.

The `zoho_mail_connect` tool does the same exchange, but its arguments are part of the conversation
transcript — prefer the helper script for the initial authorization.

### Reusing the archived `mail-integration` credentials

The archived [`retailpulses/mail-integration`](https://github.com/retailpulses/mail-integration)
worker already authorizes a Zoho client against the same US endpoints (`accounts.zoho.com` /
`mail.zoho.com`). If you have its `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, and
`ZOHO_ACCOUNT_ID`, import them instead of creating a new client — no browser round-trip:

```bash
cd engineering/stacks/zoho-mail/plugin
node scripts/zoho-auth.mjs --import --region=com \
  --client-id=<ZOHO_CLIENT_ID> \
  --account-id=<ZOHO_ACCOUNT_ID> \
  --email=<mailbox address>
```

On the Mac mini the same values live in the local Credential Registry under project `zoho`
(`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`); import them with the helper or the
plugin's connect tool. Do not commit the resulting `credentials/zoho.json`.

The helper prompts for the client secret and refresh token with hidden input. A **messages-only**
token works: with `accountId` set the plugin skips `/accounts`, and if `ZohoMail.folders` is absent
it falls back to the folder-less Inbox view. Reads, updates, and sends still work when `folderId`
comes from a message result. For a web-based client, `--auth-url --redirect-uri=<uri>` prints the
consent URL; exchange the returned code with `--grant-code=<code> --redirect-uri=<uri>`.

### 3. Use it

Ask the agent for something like "list my unread Zoho mail", "search Zoho for invoices from Acme",
or "reply to that message". The first tool call refreshes a one-hour access token automatically.

## Configuration

The bundle patch sets `allowSend`, `maxResults`, and `timeoutMs`. To override, edit the `zoho-mail`
row in your profile's `cordis.patch.yml` (or the bundle's `cordis.patch.yml` before installing):

```yaml
- id: zoho-mail
  name: '@local/dsh-zoho-mail'
  config:
    region: com                # com | eu | in | com.au | jp | ca | com.cn
    email: you@example.com     # choose a mailbox when the login exposes several
    accountId: '2560636000000008002'
    allowSend: true
    allowedRecipients: []       # e.g. ['@yourcompany.com', 'boss@example.com'] to restrict
    maxResults: 20              # default page size, capped at 200
    maxAttachmentBytes: 26214400
    timeoutMs: 30000
    credentialsFile: /absolute/path/zoho.json
    downloadsDir: /absolute/path/downloads
```

Defaults:

- Credentials: `credentials/zoho.json` inside this folder (override with `ZOHO_MAIL_CREDENTIALS`).
- Downloads: `downloads/` inside this folder.
- `region` defaults to `com`; a saved credentials file's region wins until you set `region` explicitly.
- Environment fallbacks: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`,
  `ZOHO_MAIL_REGION`, `ZOHO_ACCOUNT_ID`, `ZOHO_MAIL_ADDRESS`, `ZOHO_GRANT_CODE`.

## Safety model

- **Credentials are local.** The refresh token lives in a `0600` JSON file; tokens are never printed.
  The access token is cached in memory only.
- **Sending is explicit.** `zoho_mail_send` is enabled by default, but its description restricts it to
  user-requested sends; use `dryRun` to preview. `allowSend: false` disables it entirely, and
  `allowedRecipients` limits who can be mailed.
- **Scoped downloads.** Attachment downloads are forced into `downloads/`; filenames are sanitized,
  collisions get a numeric suffix, and files are written `0600`.
- **Reads are safe to parallelize.** Sending and state changes are marked non-concurrency-safe.
- **Large ids are preserved.** Zoho message/folder ids exceed JavaScript's safe integer range, so
  update requests are assembled with the raw digit strings instead of `JSON.stringify` numbers.

## Troubleshooting

- `Zoho OAuth error: invalid_client` — client ID/secret mismatch, or the client belongs to a different
  data center. Re-run the helper with `--region=`.
- `Zoho OAuth error: invalid_code` — the grant code is single-use and expires in about 10 minutes.
- `Zoho Mail API error (INVALID_OAUTHTOKEN)` — the refresh token was revoked or expired. Re-run
  `node scripts/zoho-auth.mjs`.
- `No Zoho Mail refresh token is stored` — authorization has not been completed yet.
- `INVALID_OAUTHSCOPE` — the refresh token lacks a scope. Re-authorize with all three scopes, or set
  `accountId` (`ZOHO_ACCOUNT_ID`) plus `email` and use `folderId` from list results with a
  messages-only token.
- `No sender address is known` — set `email` in the plugin config or `ZOHO_MAIL_ADDRESS`, or pass
  `from` to `zoho_mail_send`.
- `Message ... was not found` — pass `folderId` from a list/search result so the plugin does not have
  to scan folders.
- Rate limits: Zoho returns HTTP 429; wait and retry.

## Layout

- `index.js` — Host plugin: OAuth refresh, API transport, nine tool registrations.
- `cordis.patch.yml` — bundle patch inserting the `zoho-mail` row.
- `scripts/zoho-auth.mjs` — interactive one-time authorization helper.
- `locale/en.json`, `locale/zh.json` — Plugin Manager title and description.
- `icon.svg` — plugin icon.
- `credentials/`, `downloads/` — created on demand at runtime.
