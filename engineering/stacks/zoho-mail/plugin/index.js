import { existsSync } from 'node:fs'
import { chmod, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['tools']

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const DEFAULT_CREDENTIALS_FILE = join(PLUGIN_DIR, 'credentials', 'zoho.json')
const DEFAULT_DOWNLOADS_DIR = join(PLUGIN_DIR, 'downloads')

const SCOPES = ['ZohoMail.accounts.READ', 'ZohoMail.messages.ALL', 'ZohoMail.folders.ALL']
const MAX_LIST_LIMIT = 200
const MAX_SEND_BYTES = 25 * 1024 * 1024

const REGIONS = {
  com: { accountsBase: 'https://accounts.zoho.com', apiBase: 'https://mail.zoho.com', consoleBase: 'https://api-console.zoho.com' },
  eu: { accountsBase: 'https://accounts.zoho.eu', apiBase: 'https://mail.zoho.eu', consoleBase: 'https://api-console.zoho.eu' },
  in: { accountsBase: 'https://accounts.zoho.in', apiBase: 'https://mail.zoho.in', consoleBase: 'https://api-console.zoho.in' },
  'com.au': { accountsBase: 'https://accounts.zoho.com.au', apiBase: 'https://mail.zoho.com.au', consoleBase: 'https://api-console.zoho.com.au' },
  jp: { accountsBase: 'https://accounts.zoho.jp', apiBase: 'https://mail.zoho.jp', consoleBase: 'https://api-console.zoho.jp' },
  ca: { accountsBase: 'https://accounts.zoho.ca', apiBase: 'https://mail.zoho.ca', consoleBase: 'https://api-console.zoho.ca' },
  'com.cn': { accountsBase: 'https://accounts.zoho.com.cn', apiBase: 'https://mail.zoho.com.cn', consoleBase: 'https://api-console.zoho.com.cn' },
}

const REGION_ALIASES = { us: 'com', au: 'com.au', 'com.au': 'com.au', cn: 'com.cn', uk: 'eu', gb: 'eu' }

const DEFAULTS = {
  region: 'com',
  accountId: undefined,
  email: undefined,
  clientId: undefined,
  clientSecret: undefined,
  refreshToken: undefined,
  accountsBase: undefined,
  apiBase: undefined,
  credentialsFile: undefined,
  downloadsDir: undefined,
  allowSend: true,
  allowedRecipients: [],
  maxResults: 20,
  maxAttachmentBytes: MAX_SEND_BYTES,
  timeoutMs: 30000,
}

let tokenCache = null

function normalizeRegion(value) {
  const raw = String(value ?? 'com').trim().toLowerCase().replace(/^\./, '')
  const key = REGION_ALIASES[raw] ?? raw
  if (!Object.hasOwn(REGIONS, key)) {
    throw new Error(`Unknown Zoho data center "${value}". Use one of: ${Object.keys(REGIONS).join(', ')}.`)
  }
  return key
}

function regionInfo(region) {
  return REGIONS[normalizeRegion(region)]
}

function normalizeConfig(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  const envRegion = process.env.ZOHO_MAIL_REGION
  const regionSource = input.region ?? envRegion
  const recipients = input.allowedRecipients
  const allowedRecipients = Array.isArray(recipients)
    ? recipients.map((entry) => String(entry).trim()).filter(Boolean)
    : typeof recipients === 'string'
      ? recipients.split(',').map((entry) => entry.trim()).filter(Boolean)
      : []
  const maxResults = Number.isFinite(Number(input.maxResults)) && Number(input.maxResults) > 0
    ? Math.min(Math.floor(Number(input.maxResults)), MAX_LIST_LIMIT)
    : DEFAULTS.maxResults
  const timeoutMs = Number.isFinite(Number(input.timeoutMs)) && Number(input.timeoutMs) > 0
    ? Math.floor(Number(input.timeoutMs))
    : DEFAULTS.timeoutMs
  return {
    ...DEFAULTS,
    ...input,
    region: normalizeRegion(regionSource ?? DEFAULTS.region),
    regionExplicit: regionSource !== undefined,
    apiBaseExplicit: typeof input.apiBase === 'string' && input.apiBase.trim().length > 0,
    accountsBaseExplicit: typeof input.accountsBase === 'string' && input.accountsBase.trim().length > 0,
    accountId: firstNonEmpty(input.accountId, process.env.ZOHO_ACCOUNT_ID),
    email: firstNonEmpty(input.email, process.env.ZOHO_MAIL_ADDRESS),
    apiBase: typeof input.apiBase === 'string' ? input.apiBase.trim().replace(/\/+$/, '') : undefined,
    accountsBase: typeof input.accountsBase === 'string' ? input.accountsBase.trim().replace(/\/+$/, '') : undefined,
    credentialsFile: input.credentialsFile
      ? resolve(String(input.credentialsFile))
      : process.env.ZOHO_MAIL_CREDENTIALS
        ? resolve(process.env.ZOHO_MAIL_CREDENTIALS)
        : DEFAULT_CREDENTIALS_FILE,
    downloadsDir: input.downloadsDir ? resolve(String(input.downloadsDir)) : DEFAULT_DOWNLOADS_DIR,
    allowSend: input.allowSend !== false,
    allowedRecipients,
    maxResults,
    maxAttachmentBytes: Number(input.maxAttachmentBytes) > 0 ? Number(input.maxAttachmentBytes) : MAX_SEND_BYTES,
    timeoutMs,
  }
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text.length > 0) return text
  }
  return undefined
}

async function readCredentials(file) {
  try {
    const text = await readFile(file, 'utf8')
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') throw new Error('not an object')
    return parsed
  } catch (error) {
    if (error && error.code === 'ENOENT') return null
    if (error instanceof SyntaxError) throw new Error(`The Zoho Mail credentials file at ${file} is not valid JSON.`)
    throw error
  }
}

async function resolveSettings(cfg) {
  const stored = await readCredentials(cfg.credentialsFile)
  const region = cfg.regionExplicit
    ? cfg.region
    : stored?.region
      ? normalizeRegion(stored.region)
      : cfg.region
  const info = regionInfo(region)
  const useStoredBase = !cfg.regionExplicit && stored
  return {
    region,
    accountsBase: cfg.accountsBaseExplicit
      ? cfg.accountsBase
      : useStoredBase && stored.accountsBase
        ? stored.accountsBase
        : info.accountsBase,
    apiBase: cfg.apiBaseExplicit
      ? cfg.apiBase
      : useStoredBase && stored.apiBase
        ? stored.apiBase
        : info.apiBase,
    consoleBase: info.consoleBase,
    clientId: firstNonEmpty(cfg.clientId, process.env.ZOHO_CLIENT_ID, stored?.clientId),
    clientSecret: firstNonEmpty(cfg.clientSecret, process.env.ZOHO_CLIENT_SECRET, stored?.clientSecret),
    refreshToken: firstNonEmpty(cfg.refreshToken, process.env.ZOHO_REFRESH_TOKEN, stored?.refreshToken),
    accountId: firstNonEmpty(cfg.accountId, stored?.accountId),
    email: firstNonEmpty(cfg.email, stored?.email),
    credentialsFile: cfg.credentialsFile,
  }
}

function timeoutSignal(cfg, signal) {
  const signals = [AbortSignal.timeout(cfg.timeoutMs)]
  if (signal) signals.push(signal)
  return signals.length > 1 ? AbortSignal.any(signals) : signals[0]
}

async function fetchTimed(url, init, cfg, signal) {
  try {
    return await fetch(url, { ...init, signal: timeoutSignal(cfg, signal) })
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      throw new Error(`Zoho Mail did not answer within ${cfg.timeoutMs}ms (${new URL(String(url)).host}).`)
    }
    if (error?.name === 'AbortError') throw error
    throw new Error(`Could not reach Zoho Mail at ${new URL(String(url)).host}: ${error?.message ?? error}`)
  }
}

function tokenError(payload, response) {
  const code = payload?.error ?? payload?.status?.description ?? `HTTP ${response.status}`
  let hint = ''
  if (code === 'invalid_client' || code === 'INVALID_CLIENT') hint = ' Check the client ID and secret, and that the data center matches the client.'
  else if (code === 'invalid_code' || code === 'INVALID_CODE') hint = ' The grant code has expired; generate a fresh one in the Zoho API console.'
  else if (code === 'invalid_refresh_token' || code === 'INVALID_REFRESH_TOKEN') hint = ' The refresh token is no longer valid; re-run scripts/zoho-auth.mjs.'
  else if (code === 'Access Denied' || code === 'access_denied') hint = ' The OAuth app does not have the requested Zoho Mail scopes.'
  const detail = payload?.error_description ?? payload?.status?.description ?? ''
  return new Error(`Zoho OAuth error: ${code}${detail ? ` — ${detail}` : ''}.${hint}`)
}

async function getAccessToken(cfg, settings, signal) {
  if (!settings.clientId || !settings.clientSecret) {
    throw new Error(
      'Zoho Mail OAuth client is not configured. Create a Self Client in the Zoho API console and run `node scripts/zoho-auth.mjs` in the plugin folder (or call zoho_mail_connect).',
    )
  }
  if (!settings.refreshToken) {
    throw new Error(
      'No Zoho Mail refresh token is stored. Run `node scripts/zoho-auth.mjs` in the plugin folder to authorize the mailbox.',
    )
  }
  const key = `${settings.accountsBase}|${settings.clientId}|${settings.refreshToken.slice(-8)}`
  if (tokenCache && tokenCache.key === key && tokenCache.expiresAt > Date.now() + 30000) return tokenCache

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: settings.clientId,
    client_secret: settings.clientSecret,
    refresh_token: settings.refreshToken,
  })
  const response = await fetchTimed(
    `${settings.accountsBase}/oauth/v2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body,
    },
    cfg,
    signal,
  )
  const text = await response.text()
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error(`Zoho OAuth returned a non-JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`)
  }
  if (!response.ok || !payload.access_token) throw tokenError(payload, response)
  const lifetime = Math.max(60, Number(payload.expires_in) || 3600) * 1000
  tokenCache = {
    key,
    token: payload.access_token,
    expiresAt: Date.now() + lifetime - 60000,
  }
  return tokenCache
}

function invalidateToken() {
  tokenCache = null
}

async function apiError(response, payload, text) {
  const code = payload?.status?.code ?? payload?.error?.code ?? payload?.error
  const description =
    payload?.status?.description ??
    payload?.error?.message ??
    payload?.error_description ??
    (text ? text.slice(0, 300) : undefined)
  let message = `Zoho Mail API error${code ? ` (${code})` : ''} [HTTP ${response?.status ?? '?'}]: ${description ?? 'unknown error'}`
  const scopeIssue = /OAUTHSCOPE|invalid[ _]scope|scope.*(not|insufficient)/i.test(`${code ?? ''} ${description ?? ''}`)
  if (scopeIssue) {
    message +=
      ' — the refresh token lacks the scope this call needs. Re-authorize with ZohoMail.accounts.READ,ZohoMail.messages.ALL,ZohoMail.folders.ALL, or set accountId (ZOHO_ACCOUNT_ID) and use folderId to work with a messages-only token.'
  } else if (String(code) === 'INVALID_OAUTHTOKEN' || response?.status === 401) {
    message += ' — the access token was rejected; verify the refresh token with `node scripts/zoho-auth.mjs`.'
  }
  if (response?.status === 429) message += ' — Zoho rate limit reached; wait a moment and retry.'
  const error = new Error(message)
  error.code = code
  return error
}

async function apiRequest(cfg, path, options = {}) {
  const settings = await resolveSettings(cfg)
  if (options.settings) Object.assign(settings, options.settings)
  const { token } = await getAccessToken(cfg, settings, options.signal)

  const url = new URL(settings.apiBase + '/api' + path)
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }
  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`,
    Accept: options.accept ?? 'application/json',
  }
  if (options.form) {
    // fetch sets the multipart boundary itself.
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetchTimed(
    url,
    { method: options.method ?? 'GET', headers, body: options.form ?? options.body },
    cfg,
    options.signal,
  )

  if (response.status === 401 && !options.retried) {
    await response.text().catch(() => '')
    invalidateToken()
    return apiRequest(cfg, path, { ...options, retried: true })
  }

  if (options.binary) {
    const contentType = response.headers.get('content-type') ?? ''
    if (!response.ok || contentType.includes('application/json')) {
      const text = await response.text()
      let payload = null
      try {
        payload = JSON.parse(text)
      } catch {
        /* not JSON */
      }
      throw await apiError(response, payload, text)
    }
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType,
      disposition: response.headers.get('content-disposition') ?? '',
    }
  }

  const text = await response.text()
  let payload = null
  if (text.trim().length > 0) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }
  const code = Number(payload?.status?.code ?? 0)
  if (!response.ok || (code >= 400 && !Number.isNaN(code))) throw await apiError(response, payload, text)
  if (payload === null) throw new Error(`Zoho Mail returned a non-JSON response (HTTP ${response.status}).`)
  return payload
}

function normalizeAccount(account) {
  const addresses = Array.isArray(account.emailAddress) ? account.emailAddress : []
  const primary = addresses.find((entry) => entry?.isPrimary) ?? addresses[0]
  return {
    id: String(account.accountId ?? ''),
    primaryEmail: String(primary?.mailId ?? account.primaryEmailAddress ?? account.mailboxAddress ?? ''),
    displayName: String(account.displayName ?? account.accountDisplayName ?? ''),
    mailboxAddress: String(account.mailboxAddress ?? ''),
    aliases: addresses.filter((entry) => entry && entry.isPrimary !== true && entry.mailId).map((entry) => String(entry.mailId)),
    zuid: account.zuid === undefined ? undefined : String(account.zuid),
    usedStorage: Number(account.usedStorage) || 0,
    planStorage: Number(account.planStorage) || 0,
    enabled: account.enabled !== false && account.status !== false,
  }
}

async function getAccounts(cfg, signal) {
  const payload = await apiRequest(cfg, '/accounts', { signal })
  return (Array.isArray(payload.data) ? payload.data : []).map(normalizeAccount).filter((account) => account.id)
}

function isScopeError(error) {
  const text = String(error?.message ?? error ?? '')
  return /INVALID_OAUTHSCOPE|OAUTHSCOPE|invalid[_ ]scope|scope[^.]{0,40}(not|missing|insufficient|allowed)/i.test(text)
}

function syntheticAccount(settings) {
  const email = settings.email ?? ''
  return {
    id: settings.accountId,
    primaryEmail: email,
    displayName: '',
    mailboxAddress: email,
    aliases: [],
    zuid: undefined,
    usedStorage: 0,
    planStorage: 0,
    enabled: true,
  }
}

async function resolveAccount(cfg, signal) {
  const settings = await resolveSettings(cfg)
  if (settings.accountId) {
    const id = String(settings.accountId).trim()
    if (!/^[A-Za-z0-9_-]{5,64}$/.test(id)) {
      throw new Error(`accountId ${JSON.stringify(settings.accountId)} does not look like a Zoho account id.`)
    }
    return { account: syntheticAccount({ ...settings, accountId: id }), accounts: [] }
  }
  const accounts = await getAccounts(cfg, signal)
  if (accounts.length === 0) throw new Error('The Zoho authorization does not expose any mail account.')
  if (settings.email) {
    const wanted = String(settings.email).toLowerCase()
    const found = accounts.find(
      (account) =>
        account.primaryEmail.toLowerCase() === wanted ||
        account.mailboxAddress.toLowerCase() === wanted ||
        account.aliases.some((alias) => alias.toLowerCase() === wanted),
    )
    if (!found) throw new Error(`No Zoho mail account or alias matches ${settings.email}. Available: ${accounts.map((a) => a.primaryEmail).join(', ')}.`)
    return { account: found, accounts }
  }
  return { account: accounts[0], accounts }
}

async function getFolders(cfg, accountId, signal) {
  const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(accountId)}/folders`, { signal })
  return (Array.isArray(payload.data) ? payload.data : []).map((folder) => ({
    id: String(folder.folderId ?? ''),
    name: String(folder.folderName ?? ''),
    type: String(folder.folderType ?? ''),
    path: String(folder.path ?? ''),
    archived: String(folder.isArchived ?? '0') === '1',
  })).filter((folder) => folder.id)
}

function resolveFolder(folders, wanted) {
  const value = String(wanted ?? '').trim()
  if (value.length === 0) {
    return folders.find((folder) => folder.type.toLowerCase() === 'inbox') ?? folders[0]
  }
  if (/^\d+$/.test(value)) {
    return folders.find((folder) => folder.id === value) ?? { id: value, name: value, type: 'custom', path: '', archived: false }
  }
  const lower = value.toLowerCase()
  const byType = folders.find((folder) => folder.type.toLowerCase() === lower)
  if (byType) return byType
  const byName = folders.find((folder) => folder.name.toLowerCase() === lower)
  if (byName) return byName
  const partial = folders.find((folder) => folder.name.toLowerCase().includes(lower))
  if (partial) return partial
  throw new Error(`Folder "${value}" was not found. Available folders: ${folders.map((f) => `${f.name} (${f.id})`).join(', ')}.`)
}

function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
}

function htmlToText(html) {
  let text = String(html ?? '')
  text = text.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, ' ')
  text = text.replace(/<\s*br\s*\/?\s*>/gi, '\n')
  text = text.replace(/<\s*\/\s*(p|div|tr|li|h[1-6]|blockquote|table|section|article)\s*>/gi, '\n')
  text = text.replace(/<\s*li[^>]*>/gi, '\n• ')
  text = text.replace(/<[^>]+>/g, ' ')
  text = decodeEntities(text)
  text = text.replace(/\r\n?/g, '\n')
  text = text.replace(/[ \t\f\v]+/g, ' ')
  text = text.replace(/ *\n */g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}

function toIso(value) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  if (Number.isFinite(number) && number > 0) {
    const date = new Date(number)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeMessage(message) {
  const id = message.messageId === undefined || message.messageId === null ? '' : String(message.messageId)
  if (!id) return null
  return {
    id,
    folderId: message.folderId === undefined ? null : String(message.folderId),
    threadId: message.threadId === undefined ? null : String(message.threadId),
    subject: decodeEntities(message.subject ?? ''),
    from: decodeEntities(message.fromAddress ?? message.sender ?? ''),
    sender: decodeEntities(message.sender ?? ''),
    to: decodeEntities(message.toAddress ?? ''),
    cc: decodeEntities(message.ccAddress ?? ''),
    receivedAt: toIso(message.receivedTime ?? message.sentDateInGMT),
    summary: decodeEntities(message.summary ?? ''),
    unread: String(message.status ?? '') === '0',
    hasAttachment: String(message.hasAttachment ?? '0') === '1',
    sizeBytes: Number(message.size) || null,
    flag: message.flagid === undefined ? null : String(message.flagid),
  }
}

function normalizeAttachments(data) {
  const attachments = Array.isArray(data?.attachments) ? data.attachments : []
  const inline = Array.isArray(data?.inline) ? data.inline : []
  return [
    ...attachments.map((entry) => ({
      id: String(entry.attachmentId ?? ''),
      name: String(entry.attachmentName ?? 'attachment'),
      sizeBytes: Number(entry.attachmentSize) || null,
      inline: false,
      cid: null,
    })),
    ...inline.map((entry) => ({
      id: String(entry.attachmentId ?? ''),
      name: String(entry.attachmentName ?? 'inline-image'),
      sizeBytes: Number(entry.attachmentSize) || null,
      inline: true,
      cid: entry.cid === undefined ? null : String(entry.cid),
    })),
  ].filter((entry) => entry.id)
}

function clampLimit(cfg, value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return Math.min(cfg.maxResults, MAX_LIST_LIMIT)
  return Math.max(1, Math.min(Math.floor(number), MAX_LIST_LIMIT))
}

function requireId(value, label) {
  const text = String(value ?? '').trim()
  if (!/^\d{1,25}$/.test(text)) {
    throw new Error(`${label} must be the numeric Zoho id (digits only); got ${JSON.stringify(value)}.`)
  }
  return text
}

function splitAddresses(value) {
  if (Array.isArray(value)) return value.flatMap((entry) => splitAddresses(entry))
  const text = String(value ?? '').trim()
  if (!text) return []
  return text
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const angle = /<([^>]+)>/.exec(entry)
      return (angle ? angle[1] : entry).trim()
    })
}

function isEmail(value) {
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
}

function validateRecipients(cfg, groups) {
  const all = []
  for (const [field, value] of Object.entries(groups)) {
    const addresses = splitAddresses(value)
    for (const address of addresses) {
      if (!isEmail(address)) throw new Error(`${field} contains an invalid email address: ${JSON.stringify(address)}.`)
      if (cfg.allowedRecipients.length > 0) {
        const lower = address.toLowerCase()
        const allowed = cfg.allowedRecipients.some((rule) => {
          const normalized = rule.toLowerCase()
          if (normalized.startsWith('*@')) return lower.endsWith(normalized.slice(1))
          if (normalized.startsWith('@')) return lower.endsWith(normalized)
          return lower === normalized
        })
        if (!allowed) throw new Error(`${address} is not in this plugin's allowedRecipients list; refusing to send.`)
      }
      all.push(address)
    }
  }
  return all
}

function resolveSendPath(cfg, value) {
  const text = String(value ?? '').trim()
  if (!text) throw new Error('Attachment paths must be non-empty strings.')
  const absolute = isAbsolute(text) ? resolve(text) : resolve(PLUGIN_DIR, text)
  if (!existsSync(absolute)) throw new Error(`Attachment not found: ${absolute}`)
  return absolute
}

function safeFileName(name) {
  const cleaned = basename(String(name ?? 'attachment')).replace(/[\u0000-\u001f\u007f]/g, '').trim()
  return cleaned.length > 0 ? cleaned : 'attachment'
}

function rawIdArray(ids) {
  return `[${ids.map((id) => requireId(id, 'messageId')).join(',')}]`
}

function textRender(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function present(title, rawInput) {
  return { card: 'generic', title, kind: 'other', ...(rawInput ? { rawInput } : {}) }
}

function setupInfo(settings) {
  const folder = PLUGIN_DIR
  const region = settings.region
  return {
    apiConsole: settings.consoleBase,
    scopes: SCOPES,
    credentialsFile: settings.credentialsFile,
    commands: {
      selfClient: `cd ${folder} && node scripts/zoho-auth.mjs --region=${region}`,
      importExisting: `cd ${folder} && node scripts/zoho-auth.mjs --import --region=${region} --account-id=<ZOHO_ACCOUNT_ID> --email=<mailbox>`,
    },
    steps: [
      `New client: open ${settings.consoleBase}, add a "Self Client", copy its Client ID and secret, then generate a code with scope ${SCOPES.join(',')}.`,
      `Reuse existing credentials: if you have the mail-integration ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, and ZOHO_ACCOUNT_ID, skip the browser and import them.`,
      `Run one of the commands above in the plugin folder. Input is hidden and never enters the chat.`,
      `Or call zoho_mail_connect with a grant code, client ID, client secret, and region.`,
      `With a messages-only token, also set accountId (ZOHO_ACCOUNT_ID) and email (ZOHO_MAIL_ADDRESS).`,
    ],
  }
}

async function getDetails(cfg, accountId, folderId, messageId, signal) {
  const payload = await apiRequest(
    cfg,
    `/accounts/${encodeURIComponent(accountId)}/folders/${encodeURIComponent(folderId)}/messages/${encodeURIComponent(messageId)}/details`,
    { signal },
  )
  return payload.data ?? {}
}

async function locateFolderId(cfg, accountId, messageId, signal) {
  let folders
  try {
    folders = await getFolders(cfg, accountId, signal)
  } catch (error) {
    if (isScopeError(error)) {
      throw new Error(
        'This Zoho authorization cannot list folders, so the plugin cannot locate the message by itself. Pass folderId from a zoho_mail_list or zoho_mail_search result.',
      )
    }
    throw error
  }
  const rank = (folder) => {
    const type = folder.type.toLowerCase()
    if (type === 'inbox') return 0
    if (type === 'sent') return 2
    if (type === 'archive') return 3
    if (type === 'spam') return 4
    if (type === 'trash') return 5
    if (type === 'drafts' || type === 'templates' || type === 'snoozed') return 6
    return 1
  }
  const candidates = [...folders].sort((a, b) => rank(a) - rank(b)).slice(0, 15)
  for (const folder of candidates) {
    const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(accountId)}/messages/view`, {
      query: { folderId: folder.id, start: 1, limit: MAX_LIST_LIMIT, includeto: true },
      signal,
    })
    const messages = Array.isArray(payload.data) ? payload.data : []
    if (messages.some((message) => String(message.messageId) === messageId)) return folder.id
  }
  throw new Error(
    `Message ${messageId} was not found in the ${candidates.length} most recent folders. Pass folderId from a zoho_mail_list or zoho_mail_search result.`,
  )
}

async function executeList(cfg, args, exec) {
  const { account } = await resolveAccount(cfg, exec?.signal)
  let folders = null
  try {
    folders = await getFolders(cfg, account.id, exec?.signal)
  } catch (error) {
    if (!isScopeError(error)) throw error
    const requested = String(args?.folder ?? '').trim().toLowerCase()
    if (requested.length > 0 && requested !== 'inbox' && requested !== 'default') {
      throw new Error(
        `This Zoho authorization cannot list folders (${error.message}). Without the ZohoMail.folders scope only the Inbox is reachable; use folder "inbox" or re-authorize with all three scopes.`,
      )
    }
  }
  const folder = folders
    ? resolveFolder(folders, args?.folder)
    : { id: null, name: 'Inbox', type: 'Inbox', path: '', archived: false, scopeFallback: true }
  const start = Math.max(1, Math.floor(Number(args?.start) || 1))
  const limit = clampLimit(cfg, args?.limit)
  const query = {
    start,
    limit,
    status: args?.unreadOnly === true ? 'unread' : 'all',
    sortBy: 'date',
    sortorder: args?.sort === 'oldest' ? true : false,
    includeto: true,
  }
  if (folder.id) query.folderId = folder.id
  const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(account.id)}/messages/view`, {
    query,
    signal: exec?.signal,
  })
  const messages = (Array.isArray(payload.data) ? payload.data : []).map(normalizeMessage).filter(Boolean)
  return {
    account: { id: account.id, email: account.primaryEmail },
    folder,
    start,
    limit,
    count: messages.length,
    messages,
  }
}

async function executeSearch(cfg, args, exec) {
  const searchKey = String(args?.searchKey ?? '').trim()
  if (!searchKey) throw new Error('zoho_mail_search needs a non-empty searchKey.')
  const { account } = await resolveAccount(cfg, exec?.signal)
  const start = Math.max(1, Math.floor(Number(args?.start) || 1))
  const limit = clampLimit(cfg, args?.limit)
  const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(account.id)}/messages/search`, {
    query: { searchKey, start, limit, includeto: true },
    signal: exec?.signal,
  })
  const messages = (Array.isArray(payload.data) ? payload.data : []).map(normalizeMessage).filter(Boolean)
  return {
    account: { id: account.id, email: account.primaryEmail },
    searchKey,
    start,
    limit,
    count: messages.length,
    messages,
  }
}

async function executeFolders(cfg, args, exec) {
  const { account, accounts } = await resolveAccount(cfg, exec?.signal)
  let folders
  try {
    folders = await getFolders(cfg, account.id, exec?.signal)
  } catch (error) {
    if (!isScopeError(error)) throw error
    return {
      account: { id: account.id, email: account.primaryEmail },
      accounts: accounts.map((entry) => ({ id: entry.id, email: entry.primaryEmail })),
      count: 0,
      folders: [],
      foldersAvailable: false,
      warning:
        'This Zoho authorization lacks the ZohoMail.folders scope, so folder names and ids are unavailable. zoho_mail_list can still read the Inbox, and zoho_mail_read works when folderId comes from a message result.',
    }
  }
  return {
    account: { id: account.id, email: account.primaryEmail },
    accounts: accounts.map((entry) => ({ id: entry.id, email: entry.primaryEmail })),
    count: folders.length,
    folders,
  }
}

async function executeRead(cfg, args, exec) {
  const messageId = requireId(args?.messageId, 'messageId')
  const { account } = await resolveAccount(cfg, exec?.signal)
  const folderId = args?.folderId
    ? requireId(args.folderId, 'folderId')
    : await locateFolderId(cfg, account.id, messageId, exec?.signal)

  const base = `/accounts/${encodeURIComponent(account.id)}/folders/${encodeURIComponent(folderId)}/messages/${encodeURIComponent(messageId)}`
  const [details, content, attachmentInfo] = await Promise.all([
    getDetails(cfg, account.id, folderId, messageId, exec?.signal),
    apiRequest(cfg, `${base}/content`, { query: { includeBlockContent: true }, signal: exec?.signal }),
    apiRequest(cfg, `${base}/attachmentinfo`, { query: { includeInline: true }, signal: exec?.signal }).catch(() => ({ data: {} })),
  ])
  let headers = null
  if (args?.includeHeaders === true) {
    const response = await apiRequest(cfg, `${base}/header`, { query: { raw: false }, signal: exec?.signal })
    headers = response.data?.headerContent ?? null
  }
  const html = String(content.data?.content ?? '')
  return {
    account: { id: account.id, email: account.primaryEmail },
    folderId,
    messageId,
    subject: decodeEntities(details.subject ?? ''),
    from: decodeEntities(details.fromAddress ?? ''),
    to: decodeEntities(details.toAddress ?? ''),
    cc: decodeEntities(details.ccAddress ?? ''),
    receivedAt: toIso(details.receivedTime ?? details.sentDateInGMT),
    unread: String(details.status ?? '') === '0',
    html,
    text: htmlToText(html),
    attachments: normalizeAttachments(attachmentInfo.data),
    ...(headers ? { headers } : {}),
  }
}

async function uploadAttachments(cfg, accountId, files, signal) {
  const form = new FormData()
  let total = 0
  for (const file of files) {
    const path = resolveSendPath(cfg, file)
    const info = await stat(path)
    if (!info.isFile()) throw new Error(`Attachment is not a regular file: ${path}`)
    if (info.size > cfg.maxAttachmentBytes) {
      throw new Error(`Attachment ${basename(path)} is ${info.size} bytes, above the ${cfg.maxAttachmentBytes}-byte per-file limit.`)
    }
    total += info.size
    if (total > MAX_SEND_BYTES) throw new Error("Attachments exceed Zoho Mail's 25 MB total message limit.")
    const buffer = await readFile(path)
    form.append('attach', new Blob([buffer]), basename(path))
  }
  const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(accountId)}/messages/attachments`, {
    method: 'POST',
    query: { uploadType: 'multipart', isInline: 'false' },
    form,
    signal,
  })
  const uploaded = Array.isArray(payload.data) ? payload.data : []
  if (uploaded.length !== files.length) {
    throw new Error(`Zoho accepted ${uploaded.length} of ${files.length} attachments; nothing was sent.`)
  }
  return uploaded.map((entry) => ({
    attachmentName: String(entry.attachmentName ?? ''),
    attachmentPath: String(entry.attachmentPath ?? ''),
    storeName: String(entry.storeName ?? ''),
  }))
}

async function executeSend(cfg, args, exec) {
  if (!cfg.allowSend) throw new Error('Sending is disabled for this Zoho Mail plugin (config.allowSend is false).')
  const settings = await resolveSettings(cfg)
  const { account } = await resolveAccount(cfg, exec?.signal)
  const fromAddress = firstNonEmpty(args?.from, settings.email, account.primaryEmail)
  if (!fromAddress) {
    throw new Error('No sender address is known. Pass "from" or configure email (ZOHO_MAIL_ADDRESS) for this mailbox.')
  }
  if (!isEmail(fromAddress)) throw new Error(`The sender address ${JSON.stringify(fromAddress)} is not a valid email address.`)
  const allowedSenders = [account.primaryEmail, account.mailboxAddress, ...account.aliases]
    .filter(Boolean)
    .map((entry) => entry.toLowerCase())
  if (allowedSenders.length > 0 && !allowedSenders.includes(fromAddress.toLowerCase())) {
    throw new Error(`Cannot send as ${fromAddress}. This authorization covers: ${[account.primaryEmail, ...account.aliases].filter(Boolean).join(', ')}.`)
  }
  const to = splitAddresses(args?.to)
  const cc = splitAddresses(args?.cc)
  const bcc = splitAddresses(args?.bcc)
  if (to.length === 0) throw new Error('zoho_mail_send needs at least one "to" address.')
  validateRecipients(cfg, { to, cc, bcc })

  const subject = String(args?.subject ?? '').trim()
  const content = String(args?.body ?? '')
  if (content.trim().length === 0) throw new Error('zoho_mail_send needs a non-empty body.')
  const looksHtml = /<(html|body|div|p|br|table|span|strong|em|ul|ol)\b[^>]*>/i.test(content)
  const mailFormat = args?.format === 'html' || args?.html === true || (args?.format === undefined && looksHtml) ? 'html' : 'plaintext'
  const replyTo = args?.replyToMessageId ? requireId(args.replyToMessageId, 'replyToMessageId') : null
  const attachments = Array.isArray(args?.attachments) ? args.attachments : []
  if (replyTo && attachments.length > 0) {
    throw new Error('Zoho Mail does not attach files through its reply endpoint; send a new message with zoho_mail_send instead.')
  }

  const preview = {
    from: fromAddress,
    to,
    cc,
    bcc,
    subject,
    format: mailFormat,
    replyTo,
    attachments: attachments.map((entry) => basename(String(entry))),
  }
  if (args?.dryRun === true) return { sent: false, dryRun: true, preview }

  const uploaded = attachments.length > 0 ? await uploadAttachments(cfg, account.id, attachments, exec?.signal) : []
  const body = {
    fromAddress,
    toAddress: to.join(','),
    subject,
    content,
    mailFormat,
    encoding: 'UTF-8',
    askReceipt: 'no',
    ...(cc.length > 0 ? { ccAddress: cc.join(',') } : {}),
    ...(bcc.length > 0 ? { bccAddress: bcc.join(',') } : {}),
    ...(uploaded.length > 0 ? { attachments: uploaded } : {}),
  }

  if (replyTo) {
    const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(account.id)}/messages/${encodeURIComponent(replyTo)}`, {
      method: 'POST',
      body: JSON.stringify({ ...body, action: 'Reply' }),
      signal: exec?.signal,
    })
    return { sent: true, replyTo, result: payload.data ?? payload.status ?? {} }
  }
  const payload = await apiRequest(cfg, `/accounts/${encodeURIComponent(account.id)}/messages`, {
    method: 'POST',
    body: JSON.stringify(body),
    signal: exec?.signal,
  })
  return {
    sent: true,
    from: fromAddress,
    to,
    subject,
    attachments: uploaded.map((entry) => entry.attachmentName),
    result: payload.data ?? payload.status ?? {},
  }
}

async function executeUpdate(cfg, args, exec) {
  const action = String(args?.action ?? '')
  const ids = Array.isArray(args?.messageIds)
    ? args.messageIds.map((id) => requireId(id, 'messageId'))
    : args?.messageId
      ? [requireId(args.messageId, 'messageId')]
      : []
  if (ids.length === 0) throw new Error('zoho_mail_update needs at least one message id in messageIds.')
  if (ids.length > 50) throw new Error('zoho_mail_update handles at most 50 messages per call.')

  const { account } = await resolveAccount(cfg, exec?.signal)
  const base = `/accounts/${encodeURIComponent(account.id)}`

  if (action === 'delete') {
    const folderId = requireId(args?.folderId, 'folderId')
    const expunge = args?.expunge === true
    const deleted = []
    const failed = []
    for (const messageId of ids) {
      try {
        await apiRequest(
          cfg,
          `${base}/folders/${encodeURIComponent(folderId)}/messages/${encodeURIComponent(messageId)}`,
          { method: 'DELETE', query: { expunge }, signal: exec?.signal },
        )
        deleted.push(messageId)
      } catch (error) {
        failed.push({ messageId, error: error instanceof Error ? error.message : String(error) })
      }
    }
    return { action, folderId, expunge, deleted, failed }
  }

  const modes = {
    mark_read: 'markAsRead',
    mark_unread: 'markAsUnread',
    archive: 'archiveMails',
    unarchive: 'unArchiveMails',
    spam: 'moveToSpam',
    not_spam: 'markNotSpam',
    move: 'moveMessage',
  }
  const mode = modes[action]
  if (!mode) {
    throw new Error(`Unknown action "${action}". Use one of: ${Object.keys(modes).join(', ')}, delete.`)
  }

  const parts = [`"mode":${JSON.stringify(mode)}`, `"messageId":${rawIdArray(ids)}`]
  if (action === 'move') {
    const destination = requireId(args?.destinationFolderId, 'destinationFolderId')
    parts.push(`"destfolderId":${destination}`)
  }
  if (args?.folderId) {
    parts.push(`"folderId":${requireId(args.folderId, 'folderId')}`, `"isFolderSpecific":true`)
  }
  const body = `{${parts.join(',')}}`
  const payload = await apiRequest(cfg, `${base}/updatemessage`, {
    method: 'PUT',
    body,
    signal: exec?.signal,
  })
  return { action, mode, messageIds: ids, result: payload.status ?? payload.data ?? {} }
}

async function executeAttachment(cfg, args, exec) {
  const messageId = requireId(args?.messageId, 'messageId')
  const { account } = await resolveAccount(cfg, exec?.signal)
  const folderId = args?.folderId
    ? requireId(args.folderId, 'folderId')
    : await locateFolderId(cfg, account.id, messageId, exec?.signal)
  const base = `/accounts/${encodeURIComponent(account.id)}/folders/${encodeURIComponent(folderId)}/messages/${encodeURIComponent(messageId)}`
  const info = await apiRequest(cfg, `${base}/attachmentinfo`, { query: { includeInline: true }, signal: exec?.signal })
  const attachments = normalizeAttachments(info.data)

  if (!args?.attachmentId) {
    return { account: { id: account.id, email: account.primaryEmail }, folderId, messageId, attachments }
  }

  const attachmentId = requireId(args.attachmentId, 'attachmentId')
  const entry = attachments.find((item) => item.id === attachmentId)
  if (!entry) {
    throw new Error(
      `Attachment ${attachmentId} is not on message ${messageId}. Available: ${attachments.map((item) => `${item.name} (${item.id})`).join(', ') || 'none'}.`,
    )
  }
  const response = await apiRequest(cfg, `${base}/attachments/${encodeURIComponent(attachmentId)}`, {
    accept: 'application/octet-stream',
    binary: true,
    signal: exec?.signal,
  })
  const directory = resolve(cfg.downloadsDir)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const requested = safeFileName(args?.filename ?? entry.name)
  let target = resolve(directory, requested)
  if (!(target === directory || target.startsWith(directory + sep))) {
    throw new Error('The requested filename escapes the plugin download directory.')
  }
  let counter = 1
  while (existsSync(target)) {
    const extension = requested.includes('.') ? requested.slice(requested.lastIndexOf('.')) : ''
    const stem = extension ? requested.slice(0, -extension.length) : requested
    target = resolve(directory, `${stem}-${counter}${extension}`)
    counter += 1
  }
  await writeFile(target, response.buffer, { mode: 0o600 })
  await chmod(target, 0o600).catch(() => {})
  return {
    saved: true,
    path: target,
    name: basename(target),
    sizeBytes: response.buffer.length,
    contentType: response.contentType || null,
    messageId,
    attachmentId,
  }
}

async function executeStatus(cfg, exec) {
  let settings
  try {
    settings = await resolveSettings(cfg)
  } catch (error) {
    return { configured: false, authenticated: false, error: error instanceof Error ? error.message : String(error) }
  }
  const missing = []
  if (!settings.clientId) missing.push('clientId')
  if (!settings.clientSecret) missing.push('clientSecret')
  if (!settings.refreshToken) missing.push('refreshToken')
  const base = {
    region: settings.region,
    apiBase: settings.apiBase,
    accountsBase: settings.accountsBase,
    credentialsFile: settings.credentialsFile,
    accountId: settings.accountId ?? null,
    email: settings.email ?? null,
    tokenCached: Boolean(tokenCache && tokenCache.expiresAt > Date.now()),
  }
  if (missing.length > 0) {
    return {
      configured: false,
      authenticated: false,
      ...base,
      missing,
      setup: setupInfo(settings),
    }
  }
  try {
    const { account, accounts } = await resolveAccount(cfg, exec?.signal)
    let folders = []
    let foldersAvailable = true
    const warnings = []
    try {
      folders = await getFolders(cfg, account.id, exec?.signal)
    } catch (error) {
      if (!isScopeError(error)) throw error
      foldersAvailable = false
      warnings.push(
        'The refresh token lacks the ZohoMail.folders scope; folder listing is unavailable, but Inbox listing and message reads with a known folderId still work. Re-authorize with all three scopes for full navigation.',
      )
      // Prove the token and account id work through the messages API instead.
      await apiRequest(cfg, `/accounts/${encodeURIComponent(account.id)}/messages/view`, {
        query: { start: 1, limit: 1 },
        signal: exec?.signal,
      })
    }
    return {
      configured: true,
      authenticated: true,
      ...base,
      mode: settings.accountId ? 'account-scoped' : 'accounts-api',
      account,
      accounts: accounts.map((entry) => ({
        id: entry.id,
        email: entry.primaryEmail,
        displayName: entry.displayName,
        aliases: entry.aliases,
        usedStorage: entry.usedStorage,
        planStorage: entry.planStorage,
      })),
      folderCount: folders.length,
      folders,
      foldersAvailable,
      ...(warnings.length > 0 ? { warnings } : {}),
    }
  } catch (error) {
    return {
      configured: true,
      authenticated: false,
      ...base,
      error: error instanceof Error ? error.message : String(error),
      setup: setupInfo(settings),
    }
  }
}

async function executeConnect(cfg, args) {
  const region = normalizeRegion(args?.region ?? cfg.region)
  if (cfg.regionExplicit && region !== cfg.region) {
    throw new Error(
      `The plugin is configured for the ${cfg.region} data center, so it cannot connect to ${region}. Change config.region first, or omit the region argument.`,
    )
  }
  const info = regionInfo(region)
  const accountsBase = cfg.accountsBaseExplicit ? cfg.accountsBase : info.accountsBase
  const apiBase = cfg.apiBaseExplicit ? cfg.apiBase : info.apiBase
  const stored = await readCredentials(cfg.credentialsFile).catch(() => null)
  const clientId = firstNonEmpty(args?.clientId, cfg.clientId, process.env.ZOHO_CLIENT_ID, stored?.clientId)
  const clientSecret = firstNonEmpty(args?.clientSecret, cfg.clientSecret, process.env.ZOHO_CLIENT_SECRET, stored?.clientSecret)
  const grantCode = firstNonEmpty(args?.grantCode)
  const accountId = firstNonEmpty(args?.accountId, cfg.accountId, stored?.accountId)
  const email = firstNonEmpty(args?.email, cfg.email, stored?.email)
  const redirectUri = firstNonEmpty(args?.redirectUri)
  if (!clientId || !clientSecret) {
    throw new Error('zoho_mail_connect needs a clientId and clientSecret (or run `node scripts/zoho-auth.mjs` so the secret stays out of the chat).')
  }
  if (!grantCode) {
    throw new Error(
      `A grant code is required. In ${info.consoleBase} open your Self Client, generate a code with scope ${SCOPES.join(',')}, and pass it as grantCode.`,
    )
  }

  const response = await fetchTimed(
    `${accountsBase}/oauth/v2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: grantCode,
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      }),
    },
    cfg,
    undefined,
  )
  const text = await response.text()
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error(`Zoho OAuth returned a non-JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`)
  }
  if (!response.ok || !payload.access_token || !payload.refresh_token) throw tokenError(payload, response)

  const record = {
    version: 1,
    region,
    accountsBase,
    apiBase,
    clientId,
    clientSecret,
    refreshToken: payload.refresh_token,
    scope: payload.scope ?? SCOPES.join(','),
    ...(accountId ? { accountId } : {}),
    ...(email ? { email } : {}),
    savedAt: new Date().toISOString(),
  }
  await mkdir(dirname(cfg.credentialsFile), { recursive: true, mode: 0o700 })
  await writeFile(cfg.credentialsFile, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 })
  await chmod(cfg.credentialsFile, 0o600).catch(() => {})
  invalidateToken()

  const accounts = accountId ? [] : await getAccounts(cfg).catch(() => [])
  return {
    connected: true,
    region,
    apiBase,
    credentialsFile: cfg.credentialsFile,
    scope: record.scope,
    accountId: accountId ?? null,
    email: email ?? null,
    accounts: accounts.map((entry) => ({ id: entry.id, email: entry.primaryEmail, displayName: entry.displayName })),
  }
}

function statusTool(cfg) {
  return {
    name: 'zoho_mail_status',
    description:
      'Check the Zoho Mail plugin authorization and connection: which data center and credentials file are in use, whether the OAuth token works, and the mailbox accounts and folders that are reachable. Call it first when Zoho Mail tools fail, and to discover account ids and folder ids/names.',
    parameters: { type: 'object', additionalProperties: false, properties: {} },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('Zoho Mail status'),
    isConcurrencySafe: () => true,
    execute: (_args, exec) => executeStatus(cfg, exec),
  }
}

function connectTool(cfg) {
  return {
    name: 'zoho_mail_connect',
    description:
      'Connect the plugin to Zoho Mail by exchanging a Zoho API-console grant code for a refresh token and saving it to the plugin credentials file. Prefer the local `node scripts/zoho-auth.mjs` helper when possible, because it keeps the client secret and grant code out of the conversation. Never print or repeat the client secret or refresh token.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        grantCode: { type: 'string', description: 'The one-time grant code generated in the Zoho API console Self Client (expires in about 10 minutes).' },
        clientId: { type: 'string', description: 'The Self Client ID. Optional when already stored.' },
        clientSecret: { type: 'string', description: 'The Self Client secret. Optional when already stored; prefer the local helper script to avoid pasting it into chat.' },
        region: { type: 'string', description: 'Zoho data center: com, eu, in, com.au, jp, ca, or com.cn. Defaults to the plugin configuration.' },
        redirectUri: { type: 'string', description: 'Only for a web-based OAuth client: the exact redirect URI used when the grant code was issued.' },
        accountId: { type: 'string', description: 'Optional Zoho account id to store, so the plugin can work without the accounts API.' },
        email: { type: 'string', description: 'Optional mailbox address to store as the default sender.' },
      },
      required: ['grantCode'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('Zoho Mail connect'),
    isConcurrencySafe: () => false,
    execute: (args) => executeConnect(cfg, args),
  }
}

function foldersTool(cfg) {
  return {
    name: 'zoho_mail_folders',
    description:
      'List the Zoho Mail accounts and the folders of the selected mailbox, with folder ids, names, types, and paths. Use the ids with zoho_mail_list and zoho_mail_update.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional Zoho account id to inspect instead of the configured account.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('Zoho Mail folders'),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeFolders({ ...cfg, accountId: args?.accountId ?? cfg.accountId }, args, exec),
  }
}

function listTool(cfg) {
  return {
    name: 'zoho_mail_list',
    description:
      'List messages in a Zoho Mail folder, newest first by default. Returns message ids, folder ids, sender, recipients, subject, received time, unread flag, and a short summary. Use zoho_mail_read for the full body of one message.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        folder: { type: 'string', description: 'Folder name, type, or numeric folder id: inbox, sent, drafts, trash, spam, archive, a custom folder name, or an id from zoho_mail_folders. Defaults to the Inbox.' },
        limit: { type: 'integer', description: 'Messages to return, 1-200. Defaults to the plugin maxResults (20).' },
        start: { type: 'integer', description: '1-based offset for pagination. Defaults to 1.' },
        unreadOnly: { type: 'boolean', description: 'Return only unread messages.' },
        sort: { type: 'string', enum: ['newest', 'oldest'], description: 'Sort by received date. Defaults to newest.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('Zoho Mail list'),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeList(cfg, args, exec),
  }
}

function searchTool(cfg) {
  return {
    name: 'zoho_mail_search',
    description:
      'Search a Zoho Mail mailbox with Zoho search syntax, for example `subject:"invoice"`, `from:someone@example.com`, `has:attachment`, or `newMails`. Returns matching message summaries; use zoho_mail_read with the returned messageId and folderId for the body.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        searchKey: { type: 'string', description: 'Zoho Mail search expression.' },
        limit: { type: 'integer', description: 'Matches to return, 1-200. Defaults to the plugin maxResults (20).' },
        start: { type: 'integer', description: '1-based offset for pagination. Defaults to 1.' },
      },
      required: ['searchKey'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('Zoho Mail search', { searchKey: args?.searchKey }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeSearch(cfg, args, exec),
  }
}

function readTool(cfg) {
  return {
    name: 'zoho_mail_read',
    description:
      'Read one Zoho Mail message: metadata, the complete HTML body, a plain-text rendering, and the attachment list. Pass folderId when known (list/search results include it); otherwise the plugin locates the message across the most recent folders.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        messageId: { type: 'string', description: 'The numeric message id from a list or search result.' },
        folderId: { type: 'string', description: 'The numeric folder id that contains the message. Optional but avoids an extra lookup.' },
        includeHeaders: { type: 'boolean', description: 'Also return the raw internet headers (SPF/DKIM/auth results, Message-ID). Defaults to false.' },
      },
      required: ['messageId'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('Zoho Mail message', { messageId: args?.messageId }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeRead(cfg, args, exec),
  }
}

function sendTool(cfg) {
  return {
    name: 'zoho_mail_send',
    description:
      'Send a new message from the Zoho mailbox, or reply to an existing message with replyToMessageId. Supports local file attachments. Use dryRun to preview recipients and payload without sending. Only send when the user explicitly asked to send or reply; never send as a side effect of reading mail.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        to: { type: 'string', description: 'Comma-separated To recipients.' },
        cc: { type: 'string', description: 'Comma-separated Cc recipients.' },
        bcc: { type: 'string', description: 'Comma-separated Bcc recipients.' },
        subject: { type: 'string', description: 'Subject line.' },
        body: { type: 'string', description: 'Message body. Plain text by default.' },
        format: { type: 'string', enum: ['plaintext', 'html'], description: 'Body format. Defaults to plaintext unless html is true.' },
        html: { type: 'boolean', description: 'Shorthand for format: html.' },
        from: { type: 'string', description: 'Sender address; must be the account primary address or one of its aliases. Defaults to the configured account.' },
        attachments: { type: 'array', items: { type: 'string' }, description: 'Local file paths to attach (absolute, or relative to the plugin folder).' },
        replyToMessageId: { type: 'string', description: 'Reply to this message id instead of composing a new thread.' },
        dryRun: { type: 'boolean', description: 'Build and validate the message but do not send it.' },
      },
      required: ['to', 'subject', 'body'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present(args?.replyToMessageId ? 'Zoho Mail reply' : 'Zoho Mail send', { to: args?.to, subject: args?.subject }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeSend(cfg, args, exec),
  }
}

function updateTool(cfg) {
  return {
    name: 'zoho_mail_update',
    description:
      'Change Zoho Mail message state: mark read or unread, archive or unarchive, mark spam or not spam, move to another folder, or delete (soft delete to Trash unless expunge is true). Pass messageIds from list/search results; for delete or a folder-specific move, pass folderId of the source folder.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: {
          type: 'string',
          enum: ['mark_read', 'mark_unread', 'archive', 'unarchive', 'spam', 'not_spam', 'move', 'delete'],
          description: 'Operation to apply.',
        },
        messageIds: { type: 'array', items: { type: 'string' }, description: 'Numeric message ids, at most 50.' },
        folderId: { type: 'string', description: 'Source folder id. Required for delete; optional otherwise.' },
        destinationFolderId: { type: 'string', description: 'Target folder id. Required for move.' },
        expunge: { type: 'boolean', description: 'For delete: permanently delete instead of moving to Trash. Defaults to false.' },
      },
      required: ['action', 'messageIds'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present(`Zoho Mail ${String(args?.action ?? 'update').replace(/_/g, ' ')}`, { messageIds: args?.messageIds }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeUpdate(cfg, args, exec),
  }
}

function attachmentTool(cfg) {
  return {
    name: 'zoho_mail_attachment',
    description:
      'List a message\'s attachments, or download one attachment to the plugin downloads folder (credentials and downloads stay inside the plugin directory, with private file permissions). Returns the saved path, size, and content type.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        messageId: { type: 'string', description: 'Numeric message id.' },
        folderId: { type: 'string', description: 'Folder id that contains the message. Optional; the plugin locates it when omitted.' },
        attachmentId: { type: 'string', description: 'Attachment id from zoho_mail_read or a listing call. Omit to list attachments only.' },
        filename: { type: 'string', description: 'Optional saved filename; defaults to the attachment name.' },
      },
      required: ['messageId'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('Zoho Mail attachment', { messageId: args?.messageId }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeAttachment(cfg, args, exec),
  }
}

export function apply(ctx, rawConfig) {
  const cfg = normalizeConfig(rawConfig)
  for (const tool of [
    statusTool(cfg),
    connectTool(cfg),
    foldersTool(cfg),
    listTool(cfg),
    searchTool(cfg),
    readTool(cfg),
    sendTool(cfg),
    updateTool(cfg),
    attachmentTool(cfg),
  ]) {
    ctx.effect(() => ctx.tools.register(tool))
  }
}

export const __internals = {
  htmlToText,
  decodeEntities,
  normalizeRegion,
  normalizeConfig,
  splitAddresses,
  resolveFolder,
  normalizeMessage,
  normalizeAttachments,
  toIso,
  regionInfo,
  resolveSettings,
  setupInfo,
  SCOPES,
}
