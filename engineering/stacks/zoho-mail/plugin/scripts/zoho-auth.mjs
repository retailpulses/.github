#!/usr/bin/env node
// Zoho Mail authorization for the @local/dsh-zoho-mail plugin.
//
// Three modes:
//   1. Self Client grant code (default):
//        node scripts/zoho-auth.mjs --region=com
//   2. Import an existing refresh token (for example the one already used by
//      the archived retailpulses/mail-integration worker):
//        node scripts/zoho-auth.mjs --import --account-id=... --email=...
//   3. Print a web-based OAuth authorization URL:
//        node scripts/zoho-auth.mjs --auth-url --redirect-uri=https://...
//
// Secrets are prompted with hidden input so they never enter shell history or
// the chat transcript. Credentials are written to ../credentials/zoho.json
// with mode 0600.
import { chmod, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { __internals } from '../index.js'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const { regionInfo, SCOPES } = __internals

function parseArgs(argv) {
  const args = {}
  for (const entry of argv) {
    if (entry === '--help' || entry === '-h') args.help = true
    else if (entry === '--import' || entry === '--auth-url') args[entry.slice(2)] = true
    else if (entry.startsWith('--')) {
      const [key, ...rest] = entry.slice(2).split('=')
      args[key] = rest.join('=') || 'true'
    }
  }
  return args
}

function ask(question) {
  return new Promise((resolveQuestion) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question).then((answer) => {
      rl.close()
      resolveQuestion(answer.trim())
    })
  })
}

function askHidden(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') return ask(question)
  return new Promise((resolveAnswer, reject) => {
    let value = ''
    process.stdout.write(question)
    const stdin = process.stdin
    stdin.setEncoding('utf8')
    stdin.setRawMode(true)
    stdin.resume()
    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
    }
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          cleanup()
          process.stdout.write('\n')
          resolveAnswer(value.trim())
          return
        }
        if (char === '\u0003') {
          cleanup()
          process.stdout.write('\n')
          reject(new Error('Cancelled.'))
          return
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1)
          continue
        }
        value += char
      }
    }
    stdin.on('data', onData)
  })
}

function printHelp() {
  console.log(`Authorize the Zoho Mail plugin.

Modes:
  (default)         Exchange a Zoho API-console Self Client grant code
  --import          Store an existing client id / secret / refresh token
  --auth-url        Print a web-based OAuth authorization URL and exit

Options:
  --region=<com|eu|in|com.au|jp|ca|com.cn>  Zoho data center (default: com)
  --client-id=<id>                          OAuth client ID
  --grant-code=<code>                       One-time grant code (Self Client)
  --refresh-token=<token>                   Existing refresh token (--import)
  --redirect-uri=<uri>                      Redirect URI (web-based clients)
  --account-id=<id>                         Zoho account id (skips /accounts)
  --email=<address>                         Default sender / mailbox address
  --credentials=<path>                      Override credentials file path
  --help                                    Show this help

Environment variables (useful for non-interactive runs):
  ZOHO_MAIL_REGION, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN,
  ZOHO_GRANT_CODE, ZOHO_ACCOUNT_ID, ZOHO_MAIL_ADDRESS

New Self Client authorization needs this scope:
  ${SCOPES.join(',')}
`)
}

function authUrl(info, clientId, redirectUri) {
  const url = new URL(`${info.accountsBase}/oauth/v2/auth`)
  url.searchParams.set('scope', SCOPES.join(','))
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  if (redirectUri) url.searchParams.set('redirect_uri', redirectUri)
  return url.toString()
}

async function verify(apiBase, accessToken, accountId) {
  if (accountId) {
    const response = await fetch(`${apiBase}/api/accounts/${encodeURIComponent(accountId)}/messages/view?start=1&limit=1`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, Accept: 'application/json' },
    })
    const payload = await response.json().catch(() => ({}))
    return { ok: response.ok, messages: Array.isArray(payload.data) ? payload.data.length : 0 }
  }
  const response = await fetch(`${apiBase}/api/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, Accept: 'application/json' },
  })
  const payload = await response.json().catch(() => ({}))
  return { ok: response.ok, accounts: Array.isArray(payload.data) ? payload.data : [] }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const region = args.region ?? process.env.ZOHO_MAIL_REGION ?? 'com'
  let info
  try {
    info = regionInfo(region)
  } catch (error) {
    console.error(`✗ ${error.message}`)
    process.exitCode = 1
    return
  }

  const clientId = args['client-id'] ?? process.env.ZOHO_CLIENT_ID ?? (await ask('Client ID: '))
  const redirectUri = args['redirect-uri'] ?? process.env.ZOHO_REDIRECT_URI

  if (args['auth-url']) {
    if (!clientId) {
      console.error('✗ --auth-url needs a client ID (--client-id) and normally a redirect URI (--redirect-uri).')
      process.exitCode = 1
      return
    }
    console.log(authUrl(info, clientId, redirectUri))
    return
  }

  const clientSecret = process.env.ZOHO_CLIENT_SECRET ?? (await askHidden('Client secret (hidden): '))
  if (!clientId || !clientSecret) {
    console.error('✗ Client ID and client secret are required.')
    process.exitCode = 1
    return
  }

  const importMode = args.import === true || args['refresh-token'] !== undefined
  let accountId = args['account-id'] ?? process.env.ZOHO_ACCOUNT_ID
  let email = args.email ?? process.env.ZOHO_MAIL_ADDRESS
  let refreshToken = args['refresh-token'] ?? process.env.ZOHO_REFRESH_TOKEN
  let accessToken = null
  let scope = args.scope

  if (importMode) {
    if (!accountId && process.stdin.isTTY) {
      accountId = (await ask('Zoho account ID (recommended; Enter to skip): ')) || undefined
    }
    if (!email && process.stdin.isTTY) {
      email = (await ask('Mailbox address (e.g. you@example.com): ')) || undefined
    }
    if (!refreshToken) refreshToken = await askHidden('Existing refresh token (hidden): ')
    if (!refreshToken) {
      console.error('✗ --import needs a refresh token (--refresh-token or ZOHO_REFRESH_TOKEN).')
      process.exitCode = 1
      return
    }
    const tokenResponse = await fetch(`${info.accountsBase}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    })
    const payload = await tokenResponse.json().catch(() => ({}))
    if (!tokenResponse.ok || !payload.access_token) {
      console.error(`✗ The existing refresh token was rejected (${payload.error ?? `HTTP ${tokenResponse.status}`}).`)
      process.exitCode = 1
      return
    }
    accessToken = payload.access_token
    scope = payload.scope ?? scope
    console.log(`✓ Existing refresh token accepted${scope ? ` (scope: ${scope})` : ''}.`)
  } else {
    const grantCode = args['grant-code'] ?? process.env.ZOHO_GRANT_CODE ?? (await askHidden('Grant code (hidden, from "Generate Code"): '))
    if (!grantCode) {
      console.error('✗ A grant code is required; generate one in the Zoho API console Self Client.')
      process.exitCode = 1
      return
    }
    const tokenResponse = await fetch(`${info.accountsBase}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: grantCode,
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      }),
    })
    const raw = await tokenResponse.text()
    let payload
    try {
      payload = JSON.parse(raw)
    } catch {
      console.error(`✗ Zoho returned a non-JSON response (HTTP ${tokenResponse.status}): ${raw.slice(0, 300)}`)
      process.exitCode = 1
      return
    }
    if (!tokenResponse.ok || !payload.access_token || !payload.refresh_token) {
      const code = payload.error ?? `HTTP ${tokenResponse.status}`
      const detail = payload.error_description ?? payload.status?.description ?? raw.slice(0, 300)
      console.error(`✗ Authorization failed: ${code}${detail ? ` — ${detail}` : ''}`)
      if (String(code).includes('invalid_code')) console.error('  The grant code is single-use and expires in about 10 minutes; generate a new one.')
      if (String(code).includes('invalid_client')) console.error('  Check the client ID/secret and that the data center matches the client.')
      process.exitCode = 1
      return
    }
    refreshToken = payload.refresh_token
    accessToken = payload.access_token
    scope = payload.scope ?? scope
  }

  const credentialsFile = resolve(
    args.credentials ?? process.env.ZOHO_MAIL_CREDENTIALS ?? resolve(SCRIPT_DIR, '..', 'credentials', 'zoho.json'),
  )
  const record = {
    version: 1,
    region,
    accountsBase: info.accountsBase,
    apiBase: info.apiBase,
    clientId,
    clientSecret,
    refreshToken,
    ...(scope ? { scope } : {}),
    ...(accountId ? { accountId } : {}),
    ...(email ? { email } : {}),
    ...(importMode ? { imported: true } : {}),
    savedAt: new Date().toISOString(),
  }
  await mkdir(dirname(credentialsFile), { recursive: true, mode: 0o700 })
  await writeFile(credentialsFile, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 })
  await chmod(credentialsFile, 0o600)
  console.log(`\n✓ Credentials saved to ${credentialsFile} (mode 0600).`)
  if (scope) console.log(`  Scope: ${scope}`)

  try {
    const result = await verify(info.apiBase, accessToken, accountId)
    if (!result.ok) {
      console.log('  Note: the token was saved, but verification failed. Run zoho_mail_status for details.')
    } else if (result.accounts) {
      if (result.accounts.length === 0) console.log('  Note: Zoho returned no mail accounts for this authorization.')
      for (const account of result.accounts) {
        const primary = (account.emailAddress ?? []).find((entry) => entry.isPrimary)
        console.log(`  Mailbox: ${primary?.mailId ?? account.mailboxAddress ?? account.primaryEmailAddress} (accountId ${account.accountId})`)
      }
    } else {
      console.log(`  Messages API reachable for accountId ${accountId} (${result.messages} message(s) in the first page).`)
    }
  } catch (error) {
    console.log(`  The token was saved, but verification failed: ${error.message}`)
  }
  console.log('\nCall zoho_mail_status to confirm the connection.')
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
})
