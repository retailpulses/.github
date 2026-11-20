import { existsSync } from 'node:fs'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['tools']

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const DEFAULT_CREDENTIALS_FILE = join(PLUGIN_DIR, 'credentials', 'rms.json')
const RMS_ORIGIN = 'https://api.rms.rakuten.co.jp'
const RMS_HOST = new URL(RMS_ORIGIN).host

const ORDER_PROGRESS = {
  100: '注文確認待ち',
  200: '楽天処理中',
  300: '発送待ち',
  400: '変更確定待ち',
  500: '発送済',
  600: '支払手続き中',
  700: '支払手続き済',
  800: 'キャンセル確定待ち',
  900: 'キャンセル確定',
}

const MAX_ORDER_SEARCH_DAYS = 31
const MAX_ORDER_NUMBERS = 100
const MAX_ITEMS_PER_CALL = 100
const MAX_INVENTORY_PER_CALL = 100
const MAX_PAGES = 100
const RETRY_STATUS = new Set([429, 500, 502, 503, 504])

const DEFAULTS = {
  serviceSecret: undefined,
  licenseKey: undefined,
  credentialsFile: undefined,
  allowWrites: false,
  timeoutMs: 30000,
  maxRetries: 2,
  minIntervalMs: 750,
  maxOrders: 100,
  maxItems: 20,
  maxVariants: 100,
}

const ENDPOINTS = [
  { name: 'Order search', method: 'POST', path: '/es/2.0/order/searchOrder/', read: true },
  { name: 'Order detail', method: 'POST', path: '/es/2.0/order/getOrder/', read: true },
  { name: 'Order confirm', method: 'POST', path: '/es/2.0/order/confirmOrder/', read: false },
  { name: 'Order shipping', method: 'POST', path: '/es/2.0/order/updateOrderShipping/', read: false },
  { name: 'Order cancel', method: 'POST', path: '/es/2.0/order/cancelOrder/', read: false },
  { name: 'Order cancel after shipping', method: 'POST', path: '/es/2.0/order/cancelOrderAfterShipping/', read: false },
  { name: 'Item search', method: 'GET', path: '/es/2.0/items/search', read: true },
  { name: 'Item patch', method: 'PATCH', path: '/es/2.0/items/manage-numbers/{manageNumber}', read: false },
  { name: 'Inventory variants', method: 'GET', path: '/es/2.1/inventories/variant-lists/manage-numbers/{manageNumber}', read: true },
  { name: 'Inventory single', method: 'GET', path: '/es/2.1/inventories/manage-numbers/{manageNumber}/variants/{variantId}', read: true },
  { name: 'Inventory bulk get', method: 'POST', path: '/es/2.1/inventories/bulk-get', read: true },
  { name: 'Inventory range', method: 'GET', path: '/es/2.1/inventories/bulk-get/range', read: true },
  { name: 'Inventory bulk upsert', method: 'POST', path: '/es/2.1/inventories/bulk-upsert', read: false },
]

const throttleChains = new Map()

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms))
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text.length > 0) return text
  }
  return undefined
}

function clampInteger(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(Math.floor(number), max))
}

function normalizeConfig(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  if (input.baseUrl && String(input.baseUrl).replace(/\/+$/, '') !== RMS_ORIGIN) {
    throw new Error(`RMS API baseUrl must be ${RMS_ORIGIN}. This plugin does not support alternate RMS hosts.`)
  }
  return {
    ...DEFAULTS,
    ...input,
    serviceSecret: firstNonEmpty(input.serviceSecret),
    licenseKey: firstNonEmpty(input.licenseKey),
    credentialsFile: input.credentialsFile
      ? resolve(String(input.credentialsFile))
      : process.env.RMS_CREDENTIALS
        ? resolve(process.env.RMS_CREDENTIALS)
        : DEFAULT_CREDENTIALS_FILE,
    allowWrites: input.allowWrites === true,
    timeoutMs: clampInteger(input.timeoutMs, DEFAULTS.timeoutMs, 1000, 120000),
    maxRetries: clampInteger(input.maxRetries, DEFAULTS.maxRetries, 0, 4),
    minIntervalMs: clampInteger(input.minIntervalMs, DEFAULTS.minIntervalMs, 0, 60000),
    maxOrders: clampInteger(input.maxOrders, DEFAULTS.maxOrders, 1, MAX_ORDER_NUMBERS),
    maxItems: clampInteger(input.maxItems, DEFAULTS.maxItems, 1, MAX_ITEMS_PER_CALL),
    maxVariants: clampInteger(input.maxVariants, DEFAULTS.maxVariants, 1, MAX_INVENTORY_PER_CALL),
  }
}

async function readCredentials(file) {
  try {
    const text = await readFile(file, 'utf8')
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') throw new Error('not an object')
    return parsed
  } catch (error) {
    if (error && error.code === 'ENOENT') return null
    if (error instanceof SyntaxError) throw new Error(`The RMS credentials file at ${file} is not valid JSON.`)
    throw error
  }
}

function pickCredential(name, envName, cfg, stored) {
  const fromConfig = firstNonEmpty(cfg[name])
  if (fromConfig) return { value: fromConfig, source: 'config' }
  const fromEnv = firstNonEmpty(process.env[envName])
  if (fromEnv) return { value: fromEnv, source: 'env' }
  const fromFile = firstNonEmpty(stored?.[name])
  if (fromFile) return { value: fromFile, source: 'file' }
  return { value: undefined, source: null }
}

async function resolveSettings(cfg) {
  const stored = await readCredentials(cfg.credentialsFile)
  const serviceSecret = pickCredential('serviceSecret', 'RAKUTEN_SERVICE_SECRET', cfg, stored)
  const licenseKey = pickCredential('licenseKey', 'RAKUTEN_LICENSE_KEY', cfg, stored)
  return {
    baseUrl: RMS_ORIGIN,
    credentialsFile: cfg.credentialsFile,
    serviceSecret: serviceSecret.value,
    licenseKey: licenseKey.value,
    sources: {
      serviceSecret: serviceSecret.source,
      licenseKey: licenseKey.source,
    },
  }
}

function buildAuthHeader(serviceSecret, licenseKey) {
  if (!serviceSecret || !licenseKey) {
    throw new Error(
      'RMS credentials are missing. Set RAKUTEN_SERVICE_SECRET and RAKUTEN_LICENSE_KEY, or run `node scripts/rms-auth.mjs` in the plugin folder.',
    )
  }
  const token = Buffer.from(`${serviceSecret}:${licenseKey}`, 'utf8').toString('base64')
  return `ESA ${token}`
}

function redact(text, settings) {
  let output = String(text ?? '')
  for (const value of [settings?.serviceSecret, settings?.licenseKey]) {
    if (value) output = output.split(value).join('[REDACTED]')
  }
  if (settings?.serviceSecret && settings?.licenseKey) {
    const token = Buffer.from(`${settings.serviceSecret}:${settings.licenseKey}`, 'utf8').toString('base64')
    output = output.split(token).join('[REDACTED]')
  }
  return output
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
      throw new Error(`RMS did not answer within ${cfg.timeoutMs}ms (${RMS_HOST}).`)
    }
    if (error?.name === 'AbortError') throw error
    throw new Error(`Could not reach RMS at ${RMS_HOST}: ${error?.message ?? error}`)
  }
}

async function throttle(cfg, group) {
  if (!cfg.minIntervalMs) return
  const previous = throttleChains.get(group) ?? Promise.resolve()
  const next = previous.then(async () => {
    const last = throttleChains.get(`${group}:last`) ?? 0
    const wait = cfg.minIntervalMs - (Date.now() - last)
    if (wait > 0) await sleep(wait)
    throttleChains.set(`${group}:last`, Date.now())
  })
  throttleChains.set(group, next.catch(() => {}))
  await next
}

function requestIdOf(response) {
  return (
    response?.headers?.get('x-rakuten-request-id') ??
    response?.headers?.get('x-request-id') ??
    null
  )
}

function extractErrors(payload) {
  const messages = []
  if (Array.isArray(payload?.errors)) {
    for (const entry of payload.errors) {
      messages.push({
        code: entry?.code ?? null,
        message: entry?.message ?? String(entry),
      })
    }
  }
  if (Array.isArray(payload?.MessageModelList)) {
    for (const entry of payload.MessageModelList) {
      if (String(entry?.messageType ?? '').toUpperCase() === 'ERROR') {
        messages.push({ code: entry?.messageCode ?? null, message: entry?.message ?? '' })
      }
    }
  }
  if (messages.length === 0 && payload?.error) {
    messages.push({ code: payload.error.code ?? null, message: payload.error.message ?? String(payload.error) })
  }
  return messages
}

function apiError(response, payload, text, settings) {
  const errors = extractErrors(payload)
  const detail = errors.length > 0
    ? errors.map((entry) => `${entry.code ? `${entry.code}: ` : ''}${entry.message}`).join('; ')
    : payload?.message ?? (text ? String(text).slice(0, 500) : 'unknown error')
  let message = `RMS API error [HTTP ${response?.status ?? '?'}]: ${redact(detail, settings)}`
  if (response?.status === 401) {
    message +=
      ' — RMS rejected the ESA credentials or this shop has no subscription for that API. Verify the service secret/license key and the API plan in RMS WEB SERVICE.'
  } else if (response?.status === 403) {
    message += ' — the credentials are valid but this API is not permitted for the app or shop.'
  } else if (response?.status === 429) {
    message += ' — RMS rate limit reached; wait and retry.'
  }
  const error = new Error(message)
  error.status = response?.status
  error.code = errors[0]?.code
  error.requestId = requestIdOf(response)
  return error
}

async function rmsRequest(cfg, method, path, options = {}) {
  const settings = await resolveSettings(cfg)
  const token = buildAuthHeader(settings.serviceSecret, settings.licenseKey)
  if (!path.startsWith('/es/')) throw new Error(`Refusing a non-RMS API path: ${path}`)
  const url = new URL(settings.baseUrl + path)
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const headers = {
    Authorization: token,
    Accept: 'application/json',
  }
  let body
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json; charset=utf-8'
    body = JSON.stringify(options.body)
  }

  const retryable = options.retryable === true || (method === 'GET' && options.retryable !== false)
  let lastError
  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    await throttle(cfg, options.group ?? 'default')
    let response
    try {
      response = await fetchTimed(url, { method, headers, body }, cfg, options.signal)
    } catch (error) {
      lastError = error
      if (retryable && attempt < cfg.maxRetries) {
        await sleep(500 * 2 ** attempt)
        continue
      }
      throw error
    }

    const text = await response.text()
    if (RETRY_STATUS.has(response.status) && retryable && attempt < cfg.maxRetries) {
      const retryAfter = Number(response.headers.get('retry-after'))
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt)
      continue
    }

    let payload = null
    if (text.trim().length > 0) {
      try {
        payload = JSON.parse(text)
      } catch {
        payload = null
      }
    }

    if (!response.ok) throw apiError(response, payload, text, settings)
    if (payload && extractErrors(payload).length > 0) throw apiError(response, payload, text, settings)
    if (payload === null) {
      if (options.allowEmpty && text.trim().length === 0) return { data: {}, status: response.status, requestId: requestIdOf(response) }
      if (text.trim().length === 0) return { data: {}, status: response.status, requestId: requestIdOf(response) }
      return { data: { raw: redact(text, settings) }, status: response.status, requestId: requestIdOf(response) }
    }
    return { data: payload, status: response.status, requestId: requestIdOf(response) }
  }
  throw lastError ?? new Error('RMS request failed without a response.')
}

function jstNowYmd() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type) => parts.find((entry) => entry.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

function addDaysYmd(ymd, days) {
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function toJstRmsDatetime(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type) => parts.find((entry) => entry.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+0900`
}

function normalizeRmsDateTime(value, endOfDay = false) {
  const text = String(value ?? '').trim()
  if (!text) throw new Error('A date is required.')
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return `${text}T${endOfDay ? '23:59:59' : '00:00:00'}+0900`
  }
  const normalized = text.replace(' ', 'T')
  const withOffset = /[+-]\d{2}:?\d{2}$/.test(normalized) || /Z$/.test(normalized)
  const parsed = new Date(withOffset ? normalized : `${normalized}+09:00`)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date/time ${JSON.stringify(value)}. Use YYYY-MM-DD or ISO-8601.`)
  }
  return toJstRmsDatetime(parsed)
}

function normalizeOrderRange(args) {
  const today = jstNowYmd()
  const startInput = firstNonEmpty(args?.start, args?.startDatetime, args?.startDate) ?? addDaysYmd(today, -7)
  const endInput = firstNonEmpty(args?.end, args?.endDatetime, args?.endDate) ?? today
  const startDatetime = normalizeRmsDateTime(startInput, false)
  const endDatetime = normalizeRmsDateTime(endInput, true)
  const start = Date.parse(startDatetime.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'))
  const end = Date.parse(endDatetime.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'))
  if (!(end > start)) throw new Error('The order search end must be after the start.')
  if (end - start > MAX_ORDER_SEARCH_DAYS * 86400000) {
    throw new Error(`RMS order search accepts at most ${MAX_ORDER_SEARCH_DAYS} days per request; narrow the range.`)
  }
  return { startDatetime, endDatetime }
}

function buildOrderSearchPayload(args, pageSize, page) {
  const range = normalizeOrderRange(args)
  const payload = {
    dateType: clampInteger(args?.dateType, 1, 1, 3),
    startDatetime: range.startDatetime,
    endDatetime: range.endDatetime,
    PaginationRequestModel: {
      requestRecordsAmount: pageSize,
      requestPage: page,
    },
  }
  if (Array.isArray(args?.progress) && args.progress.length > 0) {
    const progress = args.progress.map((value) => Number(value))
    for (const value of progress) {
      if (!Object.hasOwn(ORDER_PROGRESS, value)) {
        throw new Error(`Unknown order progress ${value}. Use one of: ${Object.keys(ORDER_PROGRESS).join(', ')}.`)
      }
    }
    payload.orderProgressList = progress
  }
  return payload
}

function compactVariant(variantId, variant) {
  return {
    variantId,
    skuId: variant?.merchantDefinedSkuId ?? null,
    price: variant?.standardPrice ?? null,
    referencePrice: variant?.referencePrice?.value ?? null,
    hidden: variant?.hidden === true,
    selectorValues: variant?.selectorValues ?? null,
  }
}

function compactItem(item) {
  const variants = item?.variants && typeof item.variants === 'object' ? item.variants : {}
  const variantEntries = Object.entries(variants)
  return {
    manageNumber: item?.manageNumber ?? null,
    itemNumber: item?.itemNumber ?? null,
    itemType: item?.itemType ?? null,
    title: item?.title ?? null,
    tagline: item?.tagline ?? null,
    genreId: item?.genreId ?? null,
    hideItem: item?.hideItem === true,
    unlimitedInventory: item?.unlimitedInventoryFlag === true,
    variantCount: variantEntries.length,
    variants: variantEntries.slice(0, 50).map(([id, variant]) => compactVariant(id, variant)),
    variantsTruncated: variantEntries.length > 50,
    created: item?.created ?? null,
    updated: item?.updated ?? null,
  }
}

function normalizeItemSearch(payload, offset) {
  const results = Array.isArray(payload?.results) ? payload.results : []
  return {
    offset: Number(payload?.offset ?? offset) || 0,
    numFound: Number(payload?.numFound ?? results.length) || 0,
    items: results.map((row) => compactItem(row?.item ?? row)).filter((item) => item.manageNumber),
  }
}

async function searchItemsPage(cfg, args, offset, signal) {
  const query = {
    offset,
    searchType: clampInteger(args?.searchType, 1, 1, 5),
    itemNumber: firstNonEmpty(args?.itemNumber),
    genreId: firstNonEmpty(args?.genreId),
    shopStatus: firstNonEmpty(args?.shopStatus),
  }
  const response = await rmsRequest(cfg, 'GET', '/es/2.0/items/search', {
    query,
    group: 'items',
    signal,
    retryable: true,
  })
  return normalizeItemSearch(response.data, offset)
}

async function probeItemSearch(cfg, signal) {
  const response = await rmsRequest(cfg, 'GET', '/es/2.0/items/search', {
    query: { offset: 0, searchType: 1 },
    group: 'items',
    signal,
    retryable: true,
  })
  return {
    httpStatus: response.status,
    requestId: response.requestId,
    numFound: Number(response.data?.numFound ?? 0),
  }
}

async function executeStatus(cfg, args, exec) {
  let settings
  try {
    settings = await resolveSettings(cfg)
  } catch (error) {
    return { configured: false, authenticated: false, error: error instanceof Error ? error.message : String(error) }
  }
  const missing = []
  if (!settings.serviceSecret) missing.push('serviceSecret')
  if (!settings.licenseKey) missing.push('licenseKey')
  const base = {
    baseUrl: settings.baseUrl,
    credentialsFile: settings.credentialsFile,
    credentialSources: settings.sources,
    allowWrites: cfg.allowWrites,
    timeoutMs: cfg.timeoutMs,
    minIntervalMs: cfg.minIntervalMs,
    maxOrdersPerCall: MAX_ORDER_NUMBERS,
    maxItemsPerCall: MAX_ITEMS_PER_CALL,
    maxInventoryPerCall: MAX_INVENTORY_PER_CALL,
    endpoints: ENDPOINTS,
    setup: {
      env: ['RAKUTEN_SERVICE_SECRET', 'RAKUTEN_LICENSE_KEY'],
      command: `cd ${PLUGIN_DIR} && node scripts/rms-auth.mjs`,
      importCommand: `cd ${PLUGIN_DIR} && node scripts/rms-auth.mjs --from-file <path-to-env>`,
      note: 'RMS uses ESA auth: Authorization: ESA base64(serviceSecret:licenseKey). Credentials never appear in tool output.',
    },
  }
  if (missing.length > 0) {
    return { configured: false, authenticated: false, ...base, missing }
  }
  if (args?.probe !== true) {
    return { configured: true, authenticated: null, ...base, note: 'Call with probe: true to make one read-only Item API request.' }
  }
  try {
    const probe = await probeItemSearch(cfg, exec?.signal)
    return { configured: true, authenticated: true, ...base, probe }
  } catch (error) {
    return {
      configured: true,
      authenticated: false,
      ...base,
      error: error instanceof Error ? error.message : String(error),
      requestId: error?.requestId ?? null,
      httpStatus: error?.status ?? null,
    }
  }
}

async function executeOrdersSearch(cfg, args, exec) {
  const limit = clampInteger(args?.limit, cfg.maxOrders, 1, 1000)
  const pageSize = Math.min(1000, limit)
  const numbers = []
  const messages = []
  let page = 1
  let totalPages = null
  let hasMore = false

  while (page <= MAX_PAGES && numbers.length < limit) {
    const payload = buildOrderSearchPayload(args, pageSize, page)
    const response = await rmsRequest(cfg, 'POST', '/es/2.0/order/searchOrder/', {
      body: payload,
      group: 'orders',
      signal: exec?.signal,
      retryable: true,
    })
    const data = response.data ?? {}
    const pageNumbers = Array.isArray(data.orderNumberList) ? data.orderNumberList.map(String) : []
    if (Array.isArray(data.MessageModelList)) messages.push(...data.MessageModelList)
    numbers.push(...pageNumbers)
    totalPages = data.PaginationResponseModel?.totalPages ?? null
    if (pageNumbers.length < pageSize) break
    if (totalPages !== null && page >= Number(totalPages)) {
      hasMore = false
      break
    }
    page += 1
  }

  const trimmed = numbers.slice(0, limit)
  hasMore = numbers.length > limit || (totalPages !== null && page < Number(totalPages))
  const query = buildOrderSearchPayload(args, pageSize, 1)
  return {
    query: {
      dateType: query.dateType,
      startDatetime: query.startDatetime,
      endDatetime: query.endDatetime,
      progress: query.orderProgressList ?? null,
    },
    count: trimmed.length,
    orderNumbers: trimmed,
    totalPages,
    hasMore,
    messages: messages.map((entry) => ({
      type: entry?.messageType ?? null,
      code: entry?.messageCode ?? null,
      message: entry?.message ?? null,
    })),
  }
}

function requireOrderNumbers(value, max) {
  if (!Array.isArray(value)) throw new Error('orderNumbers must be an array of RMS order numbers.')
  const numbers = value.map((entry) => String(entry).trim()).filter(Boolean)
  if (numbers.length === 0) throw new Error('At least one order number is required.')
  if (numbers.length > max) throw new Error(`At most ${max} order numbers are allowed per call.`)
  for (const number of numbers) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(number)) {
      throw new Error(`Order number ${JSON.stringify(number)} does not look like an RMS order number.`)
    }
  }
  return numbers
}

async function executeOrderDetail(cfg, args, exec) {
  const orderNumbers = requireOrderNumbers(args?.orderNumbers, MAX_ORDER_NUMBERS)
  const version = firstNonEmpty(args?.version) ?? '7'
  const response = await rmsRequest(cfg, 'POST', '/es/2.0/order/getOrder/', {
    body: { orderNumberList: orderNumbers, version },
    group: 'orders',
    signal: exec?.signal,
    retryable: true,
  })
  const data = response.data ?? {}
  return {
    requested: orderNumbers,
    count: Array.isArray(data.OrderModelList ?? data.orderModelList)
      ? (data.OrderModelList ?? data.orderModelList).length
      : 0,
    orders: data.OrderModelList ?? data.orderModelList ?? [],
    messages: data.MessageModelList ?? null,
    requestId: response.requestId,
  }
}

function requireWriteAccess(cfg, args, action) {
  if (!cfg.allowWrites) {
    throw new Error(
      `Writing is disabled for this RMS plugin (config.allowWrites is false). ${action} can change the live shop, so it requires an explicit plugin configuration change first.`,
    )
  }
  if (args?.confirm !== true) {
    throw new Error(`${action} is a live RMS write. Pass confirm: true after verifying the target.`)
  }
}

async function executeOrderConfirm(cfg, args, exec) {
  const orderNumbers = requireOrderNumbers(args?.orderNumbers, MAX_ORDER_NUMBERS)
  requireWriteAccess(cfg, args, 'Order confirmation')
  const response = await rmsRequest(cfg, 'POST', '/es/2.0/order/confirmOrder/', {
    body: { orderNumberList: orderNumbers },
    group: 'orders',
    signal: exec?.signal,
    retryable: false,
  })
  return { confirmed: true, orderNumbers, result: response.data, requestId: response.requestId }
}

function validateShippingList(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('shippingList must contain at least one shipping row.')
  return value.map((entry, index) => {
    const shippingId = Number(entry?.shippingId)
    const shippingCompanyId = Number(entry?.shippingCompanyId)
    const shippingNumber = firstNonEmpty(entry?.shippingNumber)
    if (!Number.isInteger(shippingId) || shippingId < 0) throw new Error(`shippingList[${index}].shippingId must be a non-negative integer.`)
    if (!Number.isInteger(shippingCompanyId) || shippingCompanyId <= 0) throw new Error(`shippingList[${index}].shippingCompanyId must be a positive integer.`)
    if (!shippingNumber) throw new Error(`shippingList[${index}].shippingNumber is required.`)
    return { shippingId, shippingCompanyId, shippingNumber }
  })
}

async function executeOrderShipping(cfg, args, exec) {
  const orderNumber = firstNonEmpty(args?.orderNumber)
  if (!orderNumber) throw new Error('orderNumber is required.')
  const basketId = Number(args?.basketId)
  if (!Number.isInteger(basketId) || basketId < 0) throw new Error('basketId must be a non-negative integer from the order detail.')
  const shippingList = validateShippingList(args?.shippingList)
  requireWriteAccess(cfg, args, 'Shipping registration')
  const body = {
    orderNumber,
    BasketidModelList: [{ basketId, ShippingModelList: shippingList }],
  }
  const response = await rmsRequest(cfg, 'POST', '/es/2.0/order/updateOrderShipping/', {
    body,
    group: 'orders',
    signal: exec?.signal,
    retryable: false,
  })
  return { updated: true, orderNumber, basketId, shippingList, result: response.data, requestId: response.requestId }
}

async function executeOrderCancel(cfg, args, exec) {
  const orderNumber = firstNonEmpty(args?.orderNumber)
  if (!orderNumber) throw new Error('orderNumber is required.')
  const cancelReason = clampInteger(args?.cancelReason, 0, 0, 7)
  const afterShipping = args?.afterShipping === true
  requireWriteAccess(cfg, args, afterShipping ? 'Order cancellation after shipping' : 'Order cancellation')
  const path = afterShipping ? '/es/2.0/order/cancelOrderAfterShipping/' : '/es/2.0/order/cancelOrder/'
  const body = afterShipping ? { orderNumber } : { orderNumber, cancelReason }
  const response = await rmsRequest(cfg, 'POST', path, {
    body,
    group: 'orders',
    signal: exec?.signal,
    retryable: false,
  })
  return { cancelled: true, orderNumber, afterShipping, cancelReason: afterShipping ? null : cancelReason, result: response.data, requestId: response.requestId }
}

async function executeItemsSearch(cfg, args, exec) {
  const limit = clampInteger(args?.limit, cfg.maxItems, 1, MAX_ITEMS_PER_CALL)
  const startOffset = clampInteger(args?.offset, 0, 0, 100000)
  const items = []
  let offset = startOffset
  let numFound = 0
  let hasMore = false

  while (items.length < limit) {
    const page = await searchItemsPage(cfg, args, offset, exec?.signal)
    numFound = page.numFound
    if (page.items.length === 0) break
    items.push(...page.items)
    offset += page.items.length
    if (items.length >= limit || offset >= numFound) break
    hasMore = true
    if (page.items.length < 10) break
  }

  const trimmed = items.slice(0, limit)
  return {
    numFound,
    offset: startOffset,
    nextOffset: offset,
    count: trimmed.length,
    hasMore: hasMore || offset < numFound,
    items: trimmed,
  }
}

async function executeItemDetail(cfg, args, exec) {
  const manageNumber = firstNonEmpty(args?.manageNumber)
  if (!manageNumber) throw new Error('manageNumber is required.')
  const scanPages = clampInteger(args?.scanPages, 10, 1, 50)
  const exact = await searchItemsPage(cfg, { itemNumber: manageNumber, searchType: 1 }, 0, exec?.signal)
  let found = exact.items.find((item) => item.manageNumber === manageNumber)
  if (!found) {
    let offset = 0
    for (let page = 0; page < scanPages; page++) {
      const result = await searchItemsPage(cfg, { searchType: 1 }, offset, exec?.signal)
      found = result.items.find((item) => item.manageNumber === manageNumber)
      if (found) break
      if (result.items.length === 0) break
      offset += result.items.length
      if (offset >= result.numFound) break
    }
  }
  if (!found) {
    throw new Error(
      `No item with manageNumber ${JSON.stringify(manageNumber)} was found in the first ${scanPages} search pages. This shop's Item API detail endpoints currently return 401, so the plugin can only locate items through the authorized search endpoint.`,
    )
  }
  return { item: found }
}

async function executeItemPrice(cfg, args, exec) {
  const manageNumber = firstNonEmpty(args?.manageNumber)
  const variantId = firstNonEmpty(args?.variantId)
  if (!manageNumber || !variantId) throw new Error('manageNumber and variantId are required.')
  const priceText = firstNonEmpty(args?.price)
  if (!priceText || !/^\d{1,9}$/.test(priceText)) throw new Error('price must be a positive integer amount in yen.')
  const price = Number(priceText)
  if (!Number.isInteger(price) || price <= 0) throw new Error('price must be a positive integer amount in yen.')
  requireWriteAccess(cfg, args, 'Item price update')
  const path = `/es/2.0/items/manage-numbers/${encodeURIComponent(manageNumber)}`
  const response = await rmsRequest(cfg, 'PATCH', path, {
    body: { variants: { [variantId]: { standardPrice: String(price) } } },
    group: 'items',
    signal: exec?.signal,
    retryable: false,
    allowEmpty: true,
  })
  return { updated: true, manageNumber, variantId, price, httpStatus: response.status, result: response.data, requestId: response.requestId }
}

function normalizeVariantRequests(value, max) {
  if (!Array.isArray(value)) throw new Error('variants must be an array of { manageNumber, variantId }.')
  const entries = value.map((entry) => ({
    manageNumber: firstNonEmpty(entry?.manageNumber),
    variantId: firstNonEmpty(entry?.variantId),
  }))
  if (entries.length === 0) throw new Error('At least one variant is required.')
  if (entries.length > max) throw new Error(`At most ${max} variants are allowed per call.`)
  for (const [index, entry] of entries.entries()) {
    if (!entry.manageNumber || !entry.variantId) throw new Error(`variants[${index}] needs manageNumber and variantId.`)
  }
  return entries
}

async function fetchVariantList(cfg, manageNumber, signal) {
  const response = await rmsRequest(
    cfg,
    'GET',
    `/es/2.1/inventories/variant-lists/manage-numbers/${encodeURIComponent(manageNumber)}`,
    { group: 'inventory', signal },
  )
  const list = Array.isArray(response.data?.variantList) ? response.data.variantList.map(String) : []
  return {
    manageNumber,
    variantIds: list,
    created: response.data?.created ?? null,
    updated: response.data?.updated ?? null,
  }
}

async function bulkGetInventory(cfg, variants, signal) {
  const results = []
  for (let index = 0; index < variants.length; index += MAX_INVENTORY_PER_CALL) {
    const chunk = variants.slice(index, index + MAX_INVENTORY_PER_CALL)
    const response = await rmsRequest(cfg, 'POST', '/es/2.1/inventories/bulk-get', {
      body: { inventories: chunk },
      group: 'inventory',
      signal,
      retryable: true,
    })
    const inventories = Array.isArray(response.data?.inventories) ? response.data.inventories : []
    results.push(...inventories)
  }
  return results
}

async function executeInventory(cfg, args, exec) {
  let variants
  let variantList = null
  if (Array.isArray(args?.variants) && args.variants.length > 0) {
    variants = normalizeVariantRequests(args.variants, cfg.maxVariants)
  } else {
    const manageNumber = firstNonEmpty(args?.manageNumber)
    if (!manageNumber) throw new Error('Pass variants[] or a manageNumber.')
    const list = await fetchVariantList(cfg, manageNumber, exec?.signal)
    variantList = list
    const requested = Array.isArray(args?.variantIds) && args.variantIds.length > 0
      ? args.variantIds.map((id) => ({ manageNumber, variantId: String(id) }))
      : list.variantIds.map((id) => ({ manageNumber, variantId: id }))
    if (requested.length > cfg.maxVariants) {
      throw new Error(`This item has ${requested.length} variants; the per-call cap is ${cfg.maxVariants}. Pass variantIds to narrow the request.`)
    }
    variants = requested
  }

  const inventories = await bulkGetInventory(cfg, variants, exec?.signal)
  const foundKeys = new Set(inventories.map((entry) => `${entry.manageNumber}\u0000${entry.variantId}`))
  return {
    count: inventories.length,
    variantList,
    inventories,
    missing: variants.filter((entry) => !foundKeys.has(`${entry.manageNumber}\u0000${entry.variantId}`)),
  }
}

async function executeInventoryRange(cfg, args, exec) {
  const minQuantity = args?.minQuantity === undefined ? undefined : clampInteger(args.minQuantity, 0, 0, 100000000)
  const maxQuantity = args?.maxQuantity === undefined ? undefined : clampInteger(args.maxQuantity, 100000000, 0, 100000000)
  if (minQuantity !== undefined && maxQuantity !== undefined && maxQuantity < minQuantity) {
    throw new Error('maxQuantity must be greater than or equal to minQuantity.')
  }
  const limit = clampInteger(args?.limit, 100, 1, 1000)
  const response = await rmsRequest(cfg, 'GET', '/es/2.1/inventories/bulk-get/range', {
    query: { minQuantity, maxQuantity },
    group: 'inventory',
    signal: exec?.signal,
  })
  const all = Array.isArray(response.data?.inventories) ? response.data.inventories : []
  return {
    total: all.length,
    returned: Math.min(all.length, limit),
    truncated: all.length > limit,
    inventories: all.slice(0, limit),
  }
}

async function executeInventoryUpdate(cfg, args, exec) {
  const updates = Array.isArray(args?.updates) ? args.updates : []
  if (updates.length === 0) throw new Error('updates must contain at least one variant.')
  if (updates.length > MAX_INVENTORY_PER_CALL) throw new Error(`At most ${MAX_INVENTORY_PER_CALL} updates are allowed per call.`)
  const normalized = updates.map((entry, index) => {
    const manageNumber = firstNonEmpty(entry?.manageNumber)
    const variantId = firstNonEmpty(entry?.variantId)
    const mode = firstNonEmpty(entry?.mode) ?? firstNonEmpty(args?.mode) ?? 'ABSOLUTE'
    const quantity = Number(entry?.quantity)
    if (!manageNumber || !variantId) throw new Error(`updates[${index}] needs manageNumber and variantId.`)
    if (mode !== 'ABSOLUTE' && mode !== 'RELATIVE') throw new Error(`updates[${index}].mode must be ABSOLUTE or RELATIVE.`)
    if (!Number.isInteger(quantity)) throw new Error(`updates[${index}].quantity must be an integer.`)
    if (mode === 'ABSOLUTE' && quantity < 0) throw new Error(`updates[${index}].quantity cannot be negative in ABSOLUTE mode.`)
    return { manageNumber, variantId, mode, quantity }
  })
  requireWriteAccess(cfg, args, 'Inventory update')
  const response = await rmsRequest(cfg, 'POST', '/es/2.1/inventories/bulk-upsert', {
    body: { inventories: normalized },
    group: 'inventory',
    signal: exec?.signal,
    retryable: false,
    allowEmpty: true,
  })
  return { updated: true, count: normalized.length, updates: normalized, result: response.data, requestId: response.requestId }
}

function textRender(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function present(title, rawInput) {
  return { card: 'generic', title, kind: 'other', ...(rawInput ? { rawInput } : {}) }
}

function setupSteps() {
  return [
    'RMS WEB SERVICE issues a serviceSecret for the registered app and a licenseKey for the shop.',
    `Store them with: cd ${PLUGIN_DIR} && node scripts/rms-auth.mjs (or --from-file <env-file>).`,
    'Or export RAKUTEN_SERVICE_SECRET and RAKUTEN_LICENSE_KEY before starting dsh.',
    `RMS uses ESA auth: Authorization: ESA base64(serviceSecret:licenseKey). The plugin never returns either secret.`,
  ]
}

function statusTool(cfg) {
  return {
    name: 'rms_status',
    description:
      'Check the Rakuten RMS API plugin: base URL, credential sources, write gate, endpoint and batch limits. With probe: true it performs one read-only Item API request to verify ESA authentication. Start here when RMS tools fail.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        probe: { type: 'boolean', description: 'Make one read-only Item API search request. Defaults to false.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('RMS API status'),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeStatus(cfg, args, exec),
  }
}

function ordersSearchTool(cfg) {
  return {
    name: 'rms_orders_search',
    description:
      'Search Rakuten RMS order numbers by order date and optional order progress. Returns order numbers only — pass them to rms_order_detail for full details. RMS permits at most 31 days per search; defaults to the last 7 days in Japan time.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        start: { type: 'string', description: 'Start date or datetime (YYYY-MM-DD or ISO-8601). Defaults to 7 days ago in JST.' },
        end: { type: 'string', description: 'End date or datetime (YYYY-MM-DD or ISO-8601). Defaults to today in JST.' },
        dateType: { type: 'integer', enum: [1, 2, 3], description: 'RMS dateType. 1 = order date (default).' },
        progress: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Order progress codes: 100 confirmation pending, 200 processing, 300 awaiting shipment, 400 change pending, 500 shipped, 600 payment pending, 700 paid, 800 cancel pending, 900 cancelled.',
        },
        limit: { type: 'integer', description: 'Maximum order numbers to return, 1-1000. Default 100.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS order search', { start: args?.start, end: args?.end }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeOrdersSearch(cfg, args, exec),
  }
}

function orderDetailTool(cfg) {
  return {
    name: 'rms_order_detail',
    description:
      'Fetch full Rakuten RMS order details for 1-100 order numbers, including packages, items, buyer, delivery and payment fields. Use order numbers from rms_orders_search.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNumbers: { type: 'array', items: { type: 'string' }, description: 'RMS order numbers, 1-100.' },
        version: { type: 'string', description: 'RMS getOrder schema version. Defaults to 7.' },
      },
      required: ['orderNumbers'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS order detail', { orderNumbers: args?.orderNumbers }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeOrderDetail(cfg, args, exec),
  }
}

function orderConfirmTool(cfg) {
  return {
    name: 'rms_order_confirm',
    description:
      'WRITE. Confirm RMS orders (注文確認), moving them from confirmation-pending to Rakuten processing. Disabled unless plugin config allowWrites is true, and requires confirm: true per call.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNumbers: { type: 'array', items: { type: 'string' }, description: 'RMS order numbers, 1-100.' },
        confirm: { type: 'boolean', description: 'Must be true to perform this live write.' },
      },
      required: ['orderNumbers', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS order confirm', { orderNumbers: args?.orderNumbers }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeOrderConfirm(cfg, args, exec),
  }
}

function orderShippingTool(cfg) {
  return {
    name: 'rms_order_shipping',
    description:
      'WRITE. Register carrier and tracking numbers on an RMS order with updateOrderShipping. Needs the orderNumber and basketId from rms_order_detail. Disabled unless allowWrites is true, and requires confirm: true.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNumber: { type: 'string', description: 'RMS order number.' },
        basketId: { type: 'integer', description: 'basketId from the order package (PackageModelList).' },
        shippingList: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              shippingId: { type: 'integer', description: 'Shipping row id (0-based or 1-based as returned by RMS).' },
              shippingCompanyId: { type: 'integer', description: 'RMS delivery company code, e.g. 1 Sagawa, 2 Yamato.' },
              shippingNumber: { type: 'string', description: 'Tracking number.' },
            },
            required: ['shippingId', 'shippingCompanyId', 'shippingNumber'],
          },
          description: 'One or more shipping rows.',
        },
        confirm: { type: 'boolean', description: 'Must be true to perform this live write.' },
      },
      required: ['orderNumber', 'basketId', 'shippingList', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS shipping registration', { orderNumber: args?.orderNumber }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeOrderShipping(cfg, args, exec),
  }
}

function orderCancelTool(cfg) {
  return {
    name: 'rms_order_cancel',
    description:
      'WRITE. Cancel an RMS order before shipping, or after shipping with afterShipping: true. Disabled unless allowWrites is true, and requires confirm: true. Cancellation reasons: 0-7 per RMS (0 shop reason).',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNumber: { type: 'string', description: 'RMS order number.' },
        cancelReason: { type: 'integer', minimum: 0, maximum: 7, description: 'RMS cancellation reason code. Default 0.' },
        afterShipping: { type: 'boolean', description: 'Use the after-shipping cancellation endpoint. Default false.' },
        confirm: { type: 'boolean', description: 'Must be true to perform this live write.' },
      },
      required: ['orderNumber', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS order cancel', { orderNumber: args?.orderNumber }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeOrderCancel(cfg, args, exec),
  }
}

function itemsSearchTool(cfg) {
  return {
    name: 'rms_items_search',
    description:
      'Search Rakuten RMS items through the Item API search endpoint. Returns compact item records with manageNumber, title, price and variants. Filter by exact itemNumber, genreId or shopStatus; page with offset. Use rms_item_detail for one manageNumber.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        itemNumber: { type: 'string', description: 'Exact RMS item number (this filter is verified).' },
        genreId: { type: 'string', description: 'RMS genre id.' },
        shopStatus: { type: 'string', description: 'RMS shop status filter.' },
        searchType: { type: 'integer', description: 'RMS searchType, 1-5. Default 1.' },
        offset: { type: 'integer', description: '0-based offset. Default 0.' },
        limit: { type: 'integer', description: 'Items to return, 1-100. Default 20.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS item search', { itemNumber: args?.itemNumber }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeItemsSearch(cfg, args, exec),
  }
}

function itemDetailTool(cfg) {
  return {
    name: 'rms_item_detail',
    description:
      'Fetch one RMS item by manageNumber. Tries the exact itemNumber filter first, then scans up to scanPages search pages. Item API detail/bulk-get endpoints currently return 401 for this shop, so search is the only authorized path.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        manageNumber: { type: 'string', description: 'RMS manageNumber.' },
        scanPages: { type: 'integer', description: 'Fallback pages to scan, 1-50. Default 10.' },
      },
      required: ['manageNumber'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS item detail', { manageNumber: args?.manageNumber }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeItemDetail(cfg, args, exec),
  }
}

function itemPriceTool(cfg) {
  return {
    name: 'rms_item_price',
    description:
      'WRITE. Patch one variant standard price on an RMS item (Item API 2.0 PATCH). Disabled unless allowWrites is true, and requires confirm: true. The current shop credentials return 401 for Item API detail/write, so this needs Item API 2.0 write permission before it can succeed.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        manageNumber: { type: 'string', description: 'RMS manageNumber.' },
        variantId: { type: 'string', description: 'RMS variant id.' },
        price: { type: 'integer', description: 'New standard price in yen, positive integer.' },
        confirm: { type: 'boolean', description: 'Must be true to perform this live write.' },
      },
      required: ['manageNumber', 'variantId', 'price', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS price update', { manageNumber: args?.manageNumber, variantId: args?.variantId }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeItemPrice(cfg, args, exec),
  }
}

function inventoryTool(cfg) {
  return {
    name: 'rms_inventory',
    description:
      'Read RMS Inventory API 2.1 stock. Pass manageNumber to fetch every variant (variant list + bulk-get), variantIds to narrow it, or variants[] for up to 100 specific manageNumber/variantId pairs. Returns quantity, created and updated timestamps.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        manageNumber: { type: 'string', description: 'RMS manageNumber. Fetches all variants when variantIds is omitted.' },
        variantIds: { type: 'array', items: { type: 'string' }, description: 'Variant ids under manageNumber.' },
        variants: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              manageNumber: { type: 'string' },
              variantId: { type: 'string' },
            },
            required: ['manageNumber', 'variantId'],
          },
          description: 'Explicit manageNumber/variantId pairs, up to 100.',
        },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS inventory', { manageNumber: args?.manageNumber }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeInventory(cfg, args, exec),
  }
}

function inventoryRangeTool(cfg) {
  return {
    name: 'rms_inventory_range',
    description:
      'Read RMS Inventory API 2.1 variants whose quantity falls in a range. The endpoint returns the full matching set; this tool caps the returned rows and reports whether output was truncated.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        minQuantity: { type: 'integer', description: 'Minimum quantity, inclusive. Defaults to the RMS default.' },
        maxQuantity: { type: 'integer', description: 'Maximum quantity, inclusive. Defaults to the RMS default.' },
        limit: { type: 'integer', description: 'Maximum rows to return, 1-1000. Default 100.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS inventory range', { minQuantity: args?.minQuantity, maxQuantity: args?.maxQuantity }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeInventoryRange(cfg, args, exec),
  }
}

function inventoryUpdateTool(cfg) {
  return {
    name: 'rms_inventory_update',
    description:
      'WRITE. Bulk-upsert RMS Inventory API 2.1 quantities (ABSOLUTE by default, RELATIVE optional). Zero is a valid ABSOLUTE value. Disabled unless allowWrites is true, and requires confirm: true.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              manageNumber: { type: 'string' },
              variantId: { type: 'string' },
              quantity: { type: 'integer' },
              mode: { type: 'string', enum: ['ABSOLUTE', 'RELATIVE'], description: 'Defaults to ABSOLUTE.' },
            },
            required: ['manageNumber', 'variantId', 'quantity'],
          },
          description: '1-100 inventory updates.',
        },
        mode: { type: 'string', enum: ['ABSOLUTE', 'RELATIVE'], description: 'Default mode when an update omits mode.' },
        confirm: { type: 'boolean', description: 'Must be true to perform this live write.' },
      },
      required: ['updates', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('RMS inventory update', { count: args?.updates?.length }),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeInventoryUpdate(cfg, args, exec),
  }
}

export function apply(ctx, rawConfig) {
  const cfg = normalizeConfig(rawConfig)
  for (const tool of [
    statusTool(cfg),
    ordersSearchTool(cfg),
    orderDetailTool(cfg),
    orderConfirmTool(cfg),
    orderShippingTool(cfg),
    orderCancelTool(cfg),
    itemsSearchTool(cfg),
    itemDetailTool(cfg),
    itemPriceTool(cfg),
    inventoryTool(cfg),
    inventoryRangeTool(cfg),
    inventoryUpdateTool(cfg),
  ]) {
    ctx.effect(() => ctx.tools.register(tool))
  }
}

export const __internals = {
  RMS_ORIGIN,
  ORDER_PROGRESS,
  ENDPOINTS,
  normalizeConfig,
  resolveSettings,
  buildAuthHeader,
  normalizeRmsDateTime,
  normalizeOrderRange,
  buildOrderSearchPayload,
  compactItem,
  normalizeItemSearch,
  requireWriteAccess,
  validateShippingList,
  normalizeVariantRequests,
  redact,
  probeItemSearch,
  setupSteps,
}
