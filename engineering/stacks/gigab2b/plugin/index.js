import { createHmac, randomInt } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['tools']

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const DEFAULT_CREDENTIALS_FILE = join(PLUGIN_DIR, 'credentials', 'giga.json')

const PRODUCTION_BASE_URL = 'https://openapi.gigab2b.com'
const SANDBOX_BASE_URL = 'https://openapi-sandbox.gigab2b.com'
const ALLOWED_HOSTS = new Set(['openapi.gigab2b.com', 'openapi-sandbox.gigab2b.com'])
const RETIRED_HOST = 'api.gigacloudlogistics.com'

const MAX_SKUS = 200
const MAX_ORDER_NOS = 100
const MIN_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 1000
const DEFAULT_PAGE_SIZE = 100

const ENDPOINTS = {
  inventory: {
    path: '/b2b-overseas-api/v1/buyer/inventory/quantity/v2',
    label: 'Inventory quantity',
    rate: { limit: 10, windowMs: 10_000 },
    write: false,
  },
  price: {
    path: '/b2b-overseas-api/v1/buyer/product/price/v1',
    label: 'Product price',
    rate: { limit: 10, windowMs: 10_000 },
    write: false,
  },
  products: {
    path: '/b2b-overseas-api/v1/buyer/product/skus/v1',
    label: 'Product list',
    rate: { limit: 10, windowMs: 10_000 },
    write: false,
  },
  detail: {
    path: '/b2b-overseas-api/v1/buyer/product/detailInfo/v1',
    label: 'Product details',
    rate: { limit: 20, windowMs: 10_000 },
    write: false,
  },
  orderStatus: {
    path: '/b2b-overseas-api/v1/buyer/order/status/v1',
    label: 'Order status',
    rate: { limit: 20, windowMs: 10_000 },
    write: false,
  },
  tracking: {
    path: '/b2b-overseas-api/v1/buyer/order/track-no/v1',
    label: 'Order tracking',
    rate: { limit: 20, windowMs: 10_000 },
    write: false,
  },
  dropship: {
    path: '/b2b-overseas-api/v1/buyer/order/dropShip-sync/v1',
    label: 'Dropship order sync',
    rate: { limit: 20, windowMs: 10_000 },
    write: true,
  },
}

const DEFAULTS = {
  clientId: undefined,
  clientSecret: undefined,
  baseUrl: undefined,
  environment: 'production',
  credentialsFile: undefined,
  timeoutMs: 30_000,
  maxRetries: 2,
  allowWrites: false,
}

class GigaApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'GigaApiError'
    this.code = details.code
    this.httpStatus = details.httpStatus
    this.requestId = details.requestId
    this.msg = details.msg
    this.subMsg = details.subMsg
    this.outcomeUncertain = details.outcomeUncertain === true
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

function resolveBaseUrl(input) {
  const explicit = firstNonEmpty(input.baseUrl, process.env.GIGA_OPENAPI_V2_BASE_URL, process.env.GIGA_API_BASE_URL)
  const candidate = explicit ?? (String(input.environment ?? 'production').toLowerCase() === 'sandbox' ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL)
  let url
  try {
    url = new URL(candidate)
  } catch {
    throw new Error(`Invalid GigaB2B base URL: ${candidate}`)
  }
  if (url.hostname === RETIRED_HOST) {
    throw new Error(
      'Refusing the retired GigaB2B Open API 1.0 host api.gigacloudlogistics.com. Open API 1.0 is retired; configure https://openapi.gigab2b.com (or the sandbox host).',
    )
  }
  if (!ALLOWED_HOSTS.has(url.hostname) || url.protocol !== 'https:' || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error(
      `Unsupported GigaB2B Open API 2.0 base URL "${candidate}". Use ${PRODUCTION_BASE_URL} or ${SANDBOX_BASE_URL}.`,
    )
  }
  return url.origin
}

function normalizeConfig(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  const timeoutMs = Number(input.timeoutMs) > 0 ? Math.min(Math.floor(Number(input.timeoutMs)), 120_000) : DEFAULTS.timeoutMs
  const maxRetries = Number.isInteger(Number(input.maxRetries)) ? Math.max(0, Math.min(Number(input.maxRetries), 4)) : DEFAULTS.maxRetries
  return {
    ...DEFAULTS,
    ...input,
    clientId: firstNonEmpty(input.clientId),
    clientSecret: firstNonEmpty(input.clientSecret),
    baseUrl: resolveBaseUrl(input),
    environment: String(input.environment ?? 'production').toLowerCase() === 'sandbox' ? 'sandbox' : 'production',
    credentialsFile: input.credentialsFile
      ? resolve(String(input.credentialsFile))
      : process.env.GIGA_CREDENTIALS_FILE
        ? resolve(process.env.GIGA_CREDENTIALS_FILE)
        : DEFAULT_CREDENTIALS_FILE,
    timeoutMs,
    maxRetries,
    allowWrites: input.allowWrites === true,
  }
}

function readCredentialFile(file) {
  if (!existsSync(file)) return null
  let parsed
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`The GigaB2B credentials file at ${file} is not valid JSON.`)
    throw error
  }
  if (!parsed || typeof parsed !== 'object') throw new Error(`The GigaB2B credentials file at ${file} must contain a JSON object.`)
  return {
    clientId: firstNonEmpty(parsed.clientId, parsed['client-id'], parsed.GIGA_CLIENT_ID),
    clientSecret: firstNonEmpty(parsed.clientSecret, parsed['client-secret'], parsed.GIGA_CLIENT_SECRET),
  }
}

async function resolveCredentials(cfg) {
  const file = readCredentialFile(cfg.credentialsFile)
  const clientId = firstNonEmpty(cfg.clientId, process.env.GIGA_CLIENT_ID, file?.clientId)
  const clientSecret = firstNonEmpty(cfg.clientSecret, process.env.GIGA_CLIENT_SECRET, file?.clientSecret)
  const source = {
    clientId: firstNonEmpty(cfg.clientId) ? 'config' : firstNonEmpty(process.env.GIGA_CLIENT_ID) ? 'env' : file?.clientId ? 'file' : 'missing',
    clientSecret: firstNonEmpty(cfg.clientSecret) ? 'config' : firstNonEmpty(process.env.GIGA_CLIENT_SECRET) ? 'env' : file?.clientSecret ? 'file' : 'missing',
  }
  return { clientId, clientSecret, source, fileExists: existsSync(cfg.credentialsFile) }
}

function buildSignature({ clientId, clientSecret, path, timestamp, nonce }) {
  if (!clientId || !clientSecret || !path || !timestamp || !nonce) {
    throw new Error('Missing required GigaB2B Open API 2.0 signature input')
  }
  const stringToSign = `${clientId}&${path}&${timestamp}&${nonce}`
  const secretKey = `${clientId}&${clientSecret}&${nonce}`
  // The supplier's reference implementation hashes to lowercase hex, then
  // Base64-encodes the UTF-8 bytes of that hex string for the `sign` header.
  const hexDigest = createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex')
  return Buffer.from(hexDigest, 'utf8').toString('base64')
}

function buildHeaders({ clientId, clientSecret, path, now = Date.now, nonceFactory = defaultNonce }) {
  const timestamp = String(now())
  const nonce = String(nonceFactory())
  if (!/^\d{10}$/.test(nonce)) throw new Error('GigaB2B Open API 2.0 nonce must be a 10-digit string')
  if (!/^\d{13}$/.test(timestamp)) {
    throw new Error('GigaB2B Open API 2.0 timestamp must be a 13-digit Unix epoch-millisecond string')
  }
  return {
    'Content-Type': 'application/json',
    'client-id': clientId,
    timestamp,
    nonce,
    sign: buildSignature({ clientId, clientSecret, path, timestamp, nonce }),
  }
}

function defaultNonce() {
  return randomInt(1_000_000_000, 10_000_000_000)
}

function validateSkus(value, label = 'skus') {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array of SKU strings.`)
  }
  const skus = value.map((entry) => String(entry ?? '').trim())
  if (skus.some((entry) => entry.length === 0)) throw new Error(`${label} must not contain empty strings.`)
  if (skus.length > MAX_SKUS) {
    throw new Error(`${label} supports at most ${MAX_SKUS} SKUs per request; got ${skus.length}. Split the batch.`)
  }
  return [...new Set(skus)]
}

function validateOrderNos(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('orderNo must be a non-empty array of order numbers.')
  const orderNos = value.map((entry) => String(entry ?? '').trim())
  if (orderNos.some((entry) => entry.length === 0)) throw new Error('orderNo must not contain empty strings.')
  if (orderNos.length > MAX_ORDER_NOS) {
    throw new Error(`orderNo supports at most ${MAX_ORDER_NOS} order numbers per request; got ${orderNos.length}.`)
  }
  return [...new Set(orderNos)]
}

// GigaB2B time filters use the supplier platform's wall clock (UTC+8) and the
// format "YYYY-MM-DD HH:mm:ss". ISO inputs are converted to that fixed offset.
function toGigaTime(value, label = 'time') {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new Error(`${label} is required.`)
  }
  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text} 00:00:00`
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) return text
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} "${text}" is not a valid date. Use "YYYY-MM-DD HH:mm:ss" or an ISO-8601 timestamp.`)
  }
  const shifted = new Date(parsed.getTime() + 8 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 19).replace('T', ' ')
}

function sleep(ms, signal) {
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort)
      resolvePromise()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal.reason instanceof Error ? signal.reason : new Error('Request cancelled.'))
    }
    if (signal?.aborted) {
      clearTimeout(timer)
      reject(signal.reason instanceof Error ? signal.reason : new Error('Request cancelled.'))
      return
    }
    signal?.addEventListener?.('abort', onAbort, { once: true })
  })
}

class SlidingWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit
    this.windowMs = windowMs
    this.timestamps = []
    this.chain = Promise.resolve()
  }

  acquire(signal) {
    const run = async () => {
      for (;;) {
        if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : new Error('Request cancelled.')
        const now = Date.now()
        while (this.timestamps.length > 0 && this.timestamps[0] <= now - this.windowMs) this.timestamps.shift()
        if (this.timestamps.length < this.limit) {
          this.timestamps.push(now)
          return
        }
        const waitMs = this.timestamps[0] + this.windowMs - now + 5
        await sleep(Math.max(waitMs, 1), signal)
      }
    }
    const result = this.chain.then(run, run)
    this.chain = result.catch(() => {})
    return result
  }
}

const limiters = new Map()

function limiterFor(endpointKey) {
  const endpoint = ENDPOINTS[endpointKey]
  const key = endpoint.path
  if (!limiters.has(key)) limiters.set(key, new SlidingWindowLimiter(endpoint.rate.limit, endpoint.rate.windowMs))
  return limiters.get(key)
}

function describeEnvelope(payload, httpStatus) {
  const parts = []
  if (httpStatus) parts.push(`HTTP ${httpStatus}`)
  if (payload?.code !== undefined && payload?.code !== null) parts.push(`code=${payload.code}`)
  const message = firstNonEmpty(payload?.subMsg, payload?.msg)
  if (message) parts.push(message)
  if (payload?.requestId) parts.push(`requestId=${payload.requestId}`)
  return parts.join(' ')
}

async function postEndpoint(cfg, endpointKey, body, { signal } = {}) {
  const endpoint = ENDPOINTS[endpointKey]
  const credentials = await resolveCredentials(cfg)
  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error(
      `GigaB2B Open API 2.0 credentials are missing (clientId: ${credentials.source.clientId}, clientSecret: ${credentials.source.clientSecret}). ` +
        `Set GIGA_CLIENT_ID and GIGA_CLIENT_SECRET, or run "node scripts/giga-auth.mjs" in the plugin folder to store them in ${cfg.credentialsFile}.`,
    )
  }

  const url = `${cfg.baseUrl}${endpoint.path}`
  const retryable = endpoint.write !== true
  const attempts = retryable ? cfg.maxRetries + 1 : 1
  let lastError

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1), signal)
    await limiterFor(endpointKey).acquire(signal)

    const headers = buildHeaders({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      path: endpoint.path,
    })
    const timeoutSignal = AbortSignal.timeout(cfg.timeoutMs)
    const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: requestSignal,
      })
    } catch (error) {
      if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : new Error('Request cancelled.')
      const timeout = timeoutSignal.aborted
      lastError = new GigaApiError(
        `GigaB2B ${endpoint.label} request ${timeout ? 'timed out' : 'failed'}: ${error?.message ?? error}`,
        { outcomeUncertain: true },
      )
      if (retryable && attempt < attempts - 1) continue
      throw lastError
    }

    const text = await response.text()
    let payload = null
    if (text.trim().length > 0) {
      try {
        payload = JSON.parse(text)
      } catch {
        const error = new GigaApiError(
          `GigaB2B ${endpoint.label} returned non-JSON HTTP ${response.status}: ${text.slice(0, 300)}`,
          { httpStatus: response.status, outcomeUncertain: true },
        )
        if (retryable && attempt < attempts - 1 && (response.status === 429 || response.status >= 500)) {
          lastError = error
          continue
        }
        throw error
      }
    }

    if (!response.ok) {
      const message = `GigaB2B ${endpoint.label} error — ${describeEnvelope(payload, response.status)}`
      const error = new GigaApiError(message, {
        code: payload?.code,
        httpStatus: response.status,
        requestId: payload?.requestId,
        msg: payload?.msg,
        subMsg: payload?.subMsg,
        outcomeUncertain: response.status >= 500,
      })
      if (retryable && attempt < attempts - 1 && (response.status === 429 || response.status >= 500)) {
        lastError = error
        continue
      }
      throw error
    }

    if (payload === null) throw new GigaApiError(`GigaB2B ${endpoint.label} returned an empty response body (HTTP ${response.status}).`)

    if (payload.success !== true) {
      // Business-level failure inside HTTP 200: retrying the same request will
      // not help, and for writes it could duplicate an accepted order.
      throw new GigaApiError(`GigaB2B ${endpoint.label} rejected the request — ${describeEnvelope(payload, response.status)}`, {
        code: payload.code,
        httpStatus: response.status,
        requestId: payload.requestId,
        msg: payload.msg,
        subMsg: payload.subMsg,
      })
    }

    return payload
  }

  throw lastError ?? new GigaApiError(`GigaB2B ${endpoint.label} failed after ${attempts} attempts.`)
}

function parseNextArrival(nextArrival = {}) {
  if (!nextArrival || typeof nextArrival !== 'object') return {}
  const qtyMin = Number(nextArrival.nextArrivalQtyMin ?? 0) || 0
  const qtyMax = Number(nextArrival.nextArrivalQtyMax ?? 0) || 0
  const begin = firstNonEmpty(nextArrival.nextArrivalBegin) ?? ''
  const end = firstNonEmpty(nextArrival.nextArrivalEnd) ?? ''
  const qtyDisplay = qtyMin > 0 || qtyMax > 0 ? (qtyMin === qtyMax || qtyMax === 0 ? String(qtyMin) : `${qtyMin}~${qtyMax}`) : ''
  const dateDisplay = [begin, end && end !== begin ? end : ''].filter(Boolean).join('~')
  return {
    next_arrival_qty: qtyMin,
    next_arrival_qty_min: qtyMin,
    next_arrival_qty_max: qtyMax,
    next_arrival_begin: begin || null,
    next_arrival_end: end || null,
    next_arrival_qty_display: qtyDisplay || null,
    next_arrival_date_display: dateDisplay || null,
  }
}

function findNextArrival(sellerInfo = {}) {
  if (sellerInfo.nextArrivalInventory) return sellerInfo.nextArrivalInventory
  const distributions = sellerInfo.sellerInventoryDistribution ?? sellerInfo.sellerInventoryDistributions ?? []
  if (Array.isArray(distributions)) {
    for (const row of distributions) {
      if (row?.nextArrivalInventory) return row.nextArrivalInventory
    }
  }
  return {}
}

function hasValue(value) {
  return value !== null && value !== undefined
}

function normalizeInventoryItem(item = {}) {
  const seller = item.sellerInventoryInfo ?? {}
  const buyer = item.buyerInventoryInfo ?? {}
  const found = [
    seller.sellerAvailableInventory,
    seller.discountAvailableInventory,
    buyer.totalBuyerAvailableInventory,
    buyer.totalMarginInventory,
    buyer.totalFutureInventory,
    buyer.totalSharedInventory,
    buyer.totalSystemLockedInventory,
    buyer.totalBuyerLockedInventory,
  ].some(hasValue)
  return {
    sku: firstNonEmpty(item.sku) ?? null,
    found,
    qty_available: seller.sellerAvailableInventory ?? null,
    promo_qty: seller.discountAvailableInventory ?? null,
    buyer_available: buyer.totalBuyerAvailableInventory ?? null,
    margin_qty: buyer.totalMarginInventory ?? null,
    future_qty: buyer.totalFutureInventory ?? null,
    shared_qty: buyer.totalSharedInventory ?? null,
    system_locked_qty: buyer.totalSystemLockedInventory ?? null,
    buyer_locked_qty: buyer.totalBuyerLockedInventory ?? null,
    currency: firstNonEmpty(buyer.currency) ?? null,
    ...parseNextArrival(findNextArrival(seller)),
  }
}

function normalizePriceItem(item = {}) {
  const seller = item.sellerInfo ?? {}
  const spot = Array.isArray(item.spotPrice) ? item.spotPrice : []
  return {
    sku: firstNonEmpty(item.sku) ?? null,
    found:
      item.skuAvailable === true
      || item.skuAvailable === false
      || hasValue(item.price)
      || hasValue(item.exclusivePrice)
      || hasValue(item.discountedPrice),
    currency: firstNonEmpty(item.currency) ?? null,
    unit_price: item.price ?? item.exclusivePrice ?? null,
    price: item.price ?? null,
    exclusive_price: item.exclusivePrice ?? null,
    exclusive_price_expires_at: item.exclusivePriceExpireTime ?? null,
    discounted_price: item.discountedPrice ?? null,
    promotion_from: item.promotionFrom ?? null,
    promotion_to: item.promotionTo ?? null,
    purchase_limit: item.purchaseLimit ?? null,
    shipping_fee: item.shippingFee ?? null,
    remote_shipping_fee: item.remoteShippingFee ?? null,
    shipping_fee_range: item.shippingFeeRange ?? null,
    international_fulfillment_fees: Array.isArray(item.internationalFulfillmentFees)
      ? item.internationalFulfillmentFees.length
      : null,
    map_price: item.mapPrice ?? null,
    srp_price: item.srpPrice ?? null,
    sku_available: item.skuAvailable ?? null,
    spot_price_count: spot.length,
    rebates_price_count: Array.isArray(item.rebatesPrice) ? item.rebatesPrice.length : null,
    margin_price_count: Array.isArray(item.marginPrice) ? item.marginPrice.length : null,
    seller: Object.keys(seller).length > 0
      ? {
          store: seller.sellerStore ?? null,
          type: seller.sellerType ?? null,
          code: seller.sellerCode ?? null,
          giga_index: seller.gigaIndex ?? null,
          return_rate: seller.sellerReturnRate ?? null,
          return_approval_rate: seller.sellerReturnApprovalRate ?? null,
          message_response_rate: seller.sellerMessageResponseRate ?? null,
        }
      : null,
  }
}

function normalizeProductRecord(record = {}) {
  return {
    sku: firstNonEmpty(record.sku) ?? null,
    product_name: firstNonEmpty(record.productName) ?? null,
    update_time: record.updateTime ?? null,
    first_arrival_date: record.firstArrivalDate ?? null,
    added_time: record.addedTime ?? null,
  }
}

function normalizeDetailItem(item = {}, { includeContent = false } = {}) {
  const record = {
    sku: firstNonEmpty(item.sku) ?? null,
    mpn: firstNonEmpty(item.mpn) ?? null,
    product_name: firstNonEmpty(item.productName) ?? null,
    weight_kg: item.weightKg ?? null,
    length_cm: item.lengthCm ?? null,
    width_cm: item.widthCm ?? null,
    height_cm: item.heightCm ?? null,
    weight_lb: item.weight ?? null,
    length_in: item.length ?? null,
    width_in: item.width ?? null,
    height_in: item.height ?? null,
    main_material: firstNonEmpty(item.mainMaterial) ?? null,
    main_color: firstNonEmpty(item.mainColor) ?? null,
  }
  if (includeContent) {
    record.description = item.description ?? null
    record.characteristics = Array.isArray(item.characteristics) ? item.characteristics : []
    record.image_urls = Array.isArray(item.imageUrls) ? item.imageUrls : []
  }
  return record
}

function arrayData(payload) {
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.records)) return payload.data.records
  return []
}

async function executeInventory(cfg, args, exec) {
  const skus = validateSkus(args?.skus)
  const payload = await postEndpoint(cfg, 'inventory', { skus }, { signal: exec?.signal })
  const items = arrayData(payload).map(normalizeInventoryItem)
  const bySku = new Map(items.map((item) => [item.sku, item]))
  const result = {
    api: 'inventory/quantity/v2',
    requested: skus.length,
    request_id: payload.requestId ?? null,
    count: items.length,
    records: skus.map((sku) => bySku.get(sku) ?? { sku, found: false }),
  }
  if (args?.includeRaw === true) result.raw = payload
  return result
}

async function executePrice(cfg, args, exec) {
  const skus = validateSkus(args?.skus)
  const payload = await postEndpoint(cfg, 'price', { skus }, { signal: exec?.signal })
  const items = arrayData(payload).map(normalizePriceItem)
  const bySku = new Map(items.map((item) => [item.sku, item]))
  const result = {
    api: 'product/price/v1',
    requested: skus.length,
    request_id: payload.requestId ?? null,
    count: items.length,
    records: skus.map((sku) => bySku.get(sku) ?? { sku, found: false }),
    price_note: 'unit_price is the supplier-observed price ?? exclusivePrice fallback, not a settled Standard Price definition.',
  }
  if (args?.includeRaw === true) result.raw = payload
  return result
}

function validatePageSize(value) {
  const size = value === undefined ? DEFAULT_PAGE_SIZE : Number(value)
  if (!Number.isInteger(size) || size < MIN_PAGE_SIZE || size > MAX_PAGE_SIZE) {
    throw new Error(`pageSize must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}; got ${value}.`)
  }
  return size
}

async function executeProducts(cfg, args, exec) {
  const page = args?.page === undefined ? 1 : Number(args.page)
  if (!Number.isInteger(page) || page < 1) throw new Error('page must be an integer >= 1.')
  const pageSize = validatePageSize(args?.pageSize)
  let requestedLimit
  if (args?.limit !== undefined) {
    requestedLimit = Number(args.limit)
    if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > MAX_PAGE_SIZE) {
      throw new Error(`limit must be an integer between 1 and ${MAX_PAGE_SIZE}.`)
    }
  }
  const sort = args?.sort === undefined ? 4 : Number(args.sort)
  if (!Number.isInteger(sort)) throw new Error('sort must be an integer.')
  const body = { page, pageSize, sort }

  const hasWindow = args?.startTime !== undefined || args?.endTime !== undefined
  const hasLastUpdated = args?.lastUpdatedAfter !== undefined
  if (hasWindow && hasLastUpdated) {
    throw new Error('Use either startTime/endTime (saved-time window) or lastUpdatedAfter, not both.')
  }
  if (hasLastUpdated) {
    if (args?.queryTimeType !== undefined) throw new Error('queryTimeType only applies to the startTime/endTime window mode.')
    body.lastUpdatedAfter = toGigaTime(args.lastUpdatedAfter, 'lastUpdatedAfter')
  } else {
    if (args?.startTime === undefined || args?.endTime === undefined) {
      throw new Error('Provide startTime and endTime, or lastUpdatedAfter. GigaB2B product list requires a time filter.')
    }
    body.queryTimeType = args?.queryTimeType === undefined ? 2 : Number(args.queryTimeType)
    if (!Number.isInteger(body.queryTimeType)) throw new Error('queryTimeType must be an integer.')
    body.startTime = toGigaTime(args.startTime, 'startTime')
    body.endTime = toGigaTime(args.endTime, 'endTime')
    if (body.startTime > body.endTime) throw new Error('startTime must not be later than endTime.')
  }

  const payload = await postEndpoint(cfg, 'products', body, { signal: exec?.signal })
  const allRecords = Array.isArray(payload.data?.records) ? payload.data.records.map(normalizeProductRecord) : []
  const limit = requestedLimit ?? (allRecords.length || pageSize)
  const records = allRecords.slice(0, limit)
  return {
    api: 'product/skus/v1',
    request_id: payload.requestId ?? null,
    request: body,
    page_info: payload.data?.pageInfo ?? null,
    count: allRecords.length,
    returned: records.length,
    truncated: records.length < allRecords.length,
    empty: allRecords.length === 0,
    records,
  }
}

async function executeDetail(cfg, args, exec) {
  const hasSkus = Array.isArray(args?.skus) && args.skus.length > 0
  const hasNames = Array.isArray(args?.productNames) && args.productNames.length > 0
  if (!hasSkus && !hasNames) throw new Error('Provide either skus or productNames.')
  if (hasSkus && hasNames) throw new Error('Provide either skus or productNames, not both.')

  const body = hasSkus
    ? { skus: validateSkus(args.skus) }
    : { productNames: validateSkus(args.productNames, 'productNames') }

  const payload = await postEndpoint(cfg, 'detail', body, { signal: exec?.signal })
  const includeContent = args?.includeContent === true
  const records = arrayData(payload).map((item) => normalizeDetailItem(item, { includeContent }))
  const result = {
    api: 'product/detailInfo/v1',
    request_id: payload.requestId ?? null,
    count: records.length,
    content_included: includeContent,
    records,
  }
  if (args?.includeRaw === true) result.raw = payload
  return result
}

async function executeOrderStatus(cfg, args, exec) {
  const orderNos = validateOrderNos(args?.orderNo)
  const payload = await postEndpoint(cfg, 'orderStatus', { orderNo: orderNos }, { signal: exec?.signal })
  return {
    api: 'order/status/v1',
    request_id: payload.requestId ?? null,
    requested: orderNos.length,
    orders: payload.data ?? null,
  }
}

async function executeTracking(cfg, args, exec) {
  const orderNos = validateOrderNos(args?.orderNo)
  const payload = await postEndpoint(cfg, 'tracking', { orderNo: orderNos }, { signal: exec?.signal })
  return {
    api: 'order/track-no/v1',
    request_id: payload.requestId ?? null,
    requested: orderNos.length,
    tracking: payload.data ?? null,
  }
}

async function executeDropship(cfg, args, exec) {
  if (!cfg.allowWrites) {
    throw new Error(
      'GigaB2B order writes are disabled for this plugin. Set allowWrites: true in the plugin config only if you intend to create dropship orders, and never use this call as a connectivity test.',
    )
  }
  if (args?.confirm !== true) {
    throw new Error('Refusing to write an order without confirm: true. This endpoint is non-idempotent and the exact request contract is not officially verified.')
  }
  const order = args?.order
  if (!order || typeof order !== 'object' || Array.isArray(order)) {
    throw new Error('order must be a JSON object matching the GigaB2B dropship schema.')
  }
  const payload = await postEndpoint(cfg, 'dropship', order, { signal: exec?.signal })
  return {
    api: 'order/dropShip-sync/v1',
    request_id: payload.requestId ?? null,
    success: payload.success === true,
    code: payload.code ?? null,
    msg: payload.msg ?? null,
    sub_msg: payload.subMsg ?? null,
    data: payload.data ?? null,
  }
}

async function executeStatus(cfg, args) {
  let credentials
  try {
    credentials = await resolveCredentials(cfg)
  } catch (error) {
    return {
      configured: false,
      base_url: cfg.baseUrl,
      environment: cfg.environment,
      write_enabled: cfg.allowWrites,
      error: error.message,
      credentials_file: cfg.credentialsFile,
    }
  }
  const configured = Boolean(credentials.clientId && credentials.clientSecret)
  const result = {
    configured,
    base_url: cfg.baseUrl,
    environment: cfg.environment,
    write_enabled: cfg.allowWrites,
    credentials: {
      client_id_source: credentials.source.clientId,
      client_secret_source: credentials.source.clientSecret,
      credentials_file: cfg.credentialsFile,
      credentials_file_exists: credentials.fileExists,
    },
    endpoints: Object.entries(ENDPOINTS).map(([key, endpoint]) => ({
      key,
      label: endpoint.label,
      path: endpoint.path,
      rate_limit: `${endpoint.rate.limit} requests / ${endpoint.rate.windowMs / 1000}s`,
      write: endpoint.write,
      raw_path_included: false,
    })),
    limits: {
      max_skus_per_request: MAX_SKUS,
      max_order_nos_per_request: MAX_ORDER_NOS,
      page_size_range: [MIN_PAGE_SIZE, MAX_PAGE_SIZE],
    },
  }
  if (!configured) {
    result.setup = {
      steps: [
        'Obtain a GigaB2B Open API 2.0 Client ID and Client Secret. Open API 1.0 credentials and endpoints are retired.',
        `Run "node ${join(PLUGIN_DIR, 'scripts', 'giga-auth.mjs')}" and enter the Client ID and Client Secret; input is hidden and the file is written with mode 0600.`,
        'Alternatively set GIGA_CLIENT_ID and GIGA_CLIENT_SECRET in the plugin environment.',
        'Call giga_status with probe: true to verify authentication with a read-only request.',
      ],
      credentials_file: cfg.credentialsFile,
      environment_variables: ['GIGA_CLIENT_ID', 'GIGA_CLIENT_SECRET'],
    }
  }
  if (args?.probe === true) {
    if (!configured) {
      result.probe = { ok: false, error: 'Credentials are not configured; skipping the live probe.' }
    } else if (args?.sku !== undefined) {
      try {
        const payload = await postEndpoint(cfg, 'inventory', { skus: [String(args.sku).trim()] })
        result.probe = {
          ok: true,
          endpoint: 'inventory/quantity/v2',
          sku: String(args.sku).trim(),
          request_id: payload.requestId ?? null,
          code: payload.code ?? null,
        }
      } catch (error) {
        result.probe = { ok: false, endpoint: 'inventory/quantity/v2', error: error.message }
      }
    } else {
      const now = new Date()
      try {
        const payload = await postEndpoint(cfg, 'products', {
          page: 1,
          pageSize: MIN_PAGE_SIZE,
          sort: 4,
          lastUpdatedAfter: toGigaTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), 'probe window'),
        })
        result.probe = {
          ok: true,
          endpoint: 'product/skus/v1',
          request_id: payload.requestId ?? null,
          code: payload.code ?? null,
          page_info: payload.data?.pageInfo ?? null,
        }
      } catch (error) {
        result.probe = { ok: false, endpoint: 'product/skus/v1', error: error.message }
      }
    }
  }
  return result
}

function textRender(_args, value) {
  return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
}

function present(title, rawInput) {
  return { card: 'generic', title, kind: 'other', ...(rawInput ? { rawInput } : {}) }
}

function statusTool(cfg) {
  return {
    name: 'giga_status',
    description:
      'Check the GigaB2B Open API 2.0 setup: base URL, credential sources, credentials file, write gate, endpoints and rate limits. With probe: true it also performs one read-only signed request to verify authentication. Start here when GigaB2B tools fail.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        probe: { type: 'boolean', description: 'Run one read-only live request to verify credentials. Defaults to false.' },
        sku: { type: 'string', description: 'Optional SKU used for the inventory probe; without it the probe uses a product-list page.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('GigaB2B status'),
    isConcurrencySafe: () => true,
    execute: (args) => executeStatus(cfg, args),
  }
}

function inventoryTool(cfg) {
  return {
    name: 'giga_inventory',
    description:
      'Query GigaB2B Open API 2.0 inventory (inventory/quantity/v2) for up to 200 SKUs per call. Returns seller available and promotional quantity, buyer/margin quantities, and next-arrival fields. Missing SKUs are reported with found: false.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        skus: { type: 'array', items: { type: 'string' }, description: 'SKU strings; 1-200 per call.' },
        includeRaw: { type: 'boolean', description: 'Include the raw GigaB2B response envelope. Defaults to false.' },
      },
      required: ['skus'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('GigaB2B inventory', { skus: args?.skus }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeInventory(cfg, args, exec),
  }
}

function priceTool(cfg) {
  return {
    name: 'giga_price',
    description:
      'Query GigaB2B Open API 2.0 product prices (product/price/v1) for up to 200 SKUs per call. Returns price, exclusive and discounted price, promotion window, purchase limit, shipping fees, availability and seller metrics. unit_price is a fallback expression, not a settled Standard Price.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        skus: { type: 'array', items: { type: 'string' }, description: 'SKU strings; 1-200 per call.' },
        includeRaw: { type: 'boolean', description: 'Include the raw GigaB2B response envelope. Defaults to false.' },
      },
      required: ['skus'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('GigaB2B price', { skus: args?.skus }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executePrice(cfg, args, exec),
  }
}

function productsTool(cfg) {
  return {
    name: 'giga_products',
    description:
      'List GigaB2B products (product/skus/v1) with pagination. Requires a time filter: either startTime/endTime (queryTimeType defaults to 2) or lastUpdatedAfter. pageSize must be 100-1000 (the supplier rejects smaller values). Returns pageInfo and normalized records with sku, productName, updateTime, firstArrivalDate and addedTime.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: { type: 'integer', description: 'Page number starting at 1. Defaults to 1.' },
        pageSize: { type: 'integer', description: 'Records per page, 100-1000. Defaults to 100.' },
        limit: { type: 'integer', description: 'Maximum records to return from this page (1-1000); the supplier page itself still uses pageSize. Defaults to all records on the page.' },
        sort: { type: 'integer', description: 'Supplier sort key; CatalogSync uses 4. Defaults to 4.' },
        queryTimeType: { type: 'integer', description: 'Time-window mode used with startTime/endTime. Defaults to 2.' },
        startTime: { type: 'string', description: 'Window start, "YYYY-MM-DD HH:mm:ss" or ISO-8601.' },
        endTime: { type: 'string', description: 'Window end, "YYYY-MM-DD HH:mm:ss" or ISO-8601.' },
        lastUpdatedAfter: { type: 'string', description: 'Alternative to the window: only products updated after this time.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('GigaB2B product list', { page: args?.page }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeProducts(cfg, args, exec),
  }
}

function detailTool(cfg) {
  return {
    name: 'giga_product_detail',
    description:
      'Query GigaB2B Open API 2.0 product details (product/detailInfo/v1) for up to 200 SKUs or product names. Returns dimensions, weight, material, colour and identifiers; set includeContent: true to also return description, characteristics and image URLs. Pass either skus or productNames, not both.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        skus: { type: 'array', items: { type: 'string' }, description: 'SKU strings; 1-200 per call.' },
        productNames: { type: 'array', items: { type: 'string' }, description: 'Product names; 1-200 per call. Use instead of skus.' },
        includeContent: { type: 'boolean', description: 'Include description, characteristics and image URLs. Defaults to false.' },
        includeRaw: { type: 'boolean', description: 'Include the raw GigaB2B response envelope. Defaults to false.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('GigaB2B product details'),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeDetail(cfg, args, exec),
  }
}

function orderStatusTool(cfg) {
  return {
    name: 'giga_order_status',
    description:
      'Query GigaB2B order status (order/status/v1) for up to 100 order numbers. Returns the supplier order data as-is because the documented shape is not fully verified. A supplier business error for an unknown order is reported as a tool error with code and message.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNo: { type: 'array', items: { type: 'string' }, description: 'GigaB2B order numbers; 1-100 per call.' },
      },
      required: ['orderNo'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('GigaB2B order status', { orderNo: args?.orderNo }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeOrderStatus(cfg, args, exec),
  }
}

function trackingTool(cfg) {
  return {
    name: 'giga_tracking',
    description:
      'Query GigaB2B shipping/tracking information (order/track-no/v1) for up to 100 order numbers. Returns the supplier tracking data as-is. This is a read-only call; it does not change order state.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        orderNo: { type: 'array', items: { type: 'string' }, description: 'GigaB2B order numbers; 1-100 per call.' },
      },
      required: ['orderNo'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: (args) => present('GigaB2B tracking', { orderNo: args?.orderNo }),
    isConcurrencySafe: () => true,
    execute: (args, exec) => executeTracking(cfg, args, exec),
  }
}

function dropshipTool(cfg) {
  return {
    name: 'giga_dropship_sync',
    description:
      'Create or sync a dropship order (order/dropShip-sync/v1). Disabled unless the plugin config sets allowWrites: true, and each call must pass confirm: true. Non-idempotent: never use it to test connectivity, and never retry after a timeout or 5xx because the supplier may already have accepted the order.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        order: { type: 'object', additionalProperties: true, description: 'Dropship order payload matching the supplier schema.' },
        confirm: { type: 'boolean', description: 'Must be true to confirm an intentional order write.' },
      },
      required: ['order', 'confirm'],
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: textRender },
    presentCall: () => present('GigaB2B dropship order'),
    isConcurrencySafe: () => false,
    execute: (args, exec) => executeDropship(cfg, args, exec),
  }
}

export function apply(ctx, rawConfig) {
  const cfg = normalizeConfig(rawConfig)
  for (const tool of [
    statusTool(cfg),
    inventoryTool(cfg),
    priceTool(cfg),
    productsTool(cfg),
    detailTool(cfg),
    orderStatusTool(cfg),
    trackingTool(cfg),
    dropshipTool(cfg),
  ]) {
    ctx.effect(() => ctx.tools.register(tool))
  }
}

export const __internals = {
  ENDPOINTS,
  DEFAULTS,
  MAX_SKUS,
  MAX_ORDER_NOS,
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PRODUCTION_BASE_URL,
  SANDBOX_BASE_URL,
  DEFAULT_CREDENTIALS_FILE,
  GigaApiError,
  SlidingWindowLimiter,
  buildSignature,
  buildHeaders,
  postEndpoint,
  defaultNonce,
  normalizeConfig,
  resolveBaseUrl,
  resolveCredentials,
  readCredentialFile,
  validateSkus,
  validateOrderNos,
  validatePageSize,
  toGigaTime,
  parseNextArrival,
  normalizeInventoryItem,
  normalizePriceItem,
  normalizeProductRecord,
  normalizeDetailItem,
}
