#!/usr/bin/env node
/**
 * Offline checks for the GigaB2B plugin. No live API calls are made.
 * Run: node test/run.mjs
 */
import assert from 'node:assert/strict'
import {
  apply,
  __internals as giga,
} from '../index.js'

const results = []
async function check(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`ok   ${name}`)
  } catch (error) {
    results.push({ name, ok: false, error })
    console.log(`FAIL ${name}\n     ${error.message}`)
  }
}

function clearGigaEnv() {
  delete process.env.GIGA_CLIENT_ID
  delete process.env.GIGA_CLIENT_SECRET
  delete process.env.GIGA_OPENAPI_V2_BASE_URL
  delete process.env.GIGA_API_BASE_URL
  delete process.env.GIGA_CREDENTIALS_FILE
}

const FIXED = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  path: '/b2b-overseas-api/v1/buyer/inventory/quantity/v2',
  timestamp: '1700000000000',
  nonce: '1234567890',
}

await check('signature matches the independent HMAC/base64 vector', () => {
  assert.equal(
    giga.buildSignature(FIXED),
    'ZDE5Nzk1NWUyNDJmM2I1MDkxMTcwOGFmZDNjMTI1ODgyYTI0YzU5NjI0YzM2ZmE1YzM4NWRjNzNhNjhjZDcyOA==',
  )
})

await check('headers use the documented lowercase names and formats', () => {
  const headers = giga.buildHeaders({ ...FIXED, now: () => 1700000000000, nonceFactory: () => 1234567890 })
  assert.equal(headers['Content-Type'], 'application/json')
  assert.equal(headers['client-id'], FIXED.clientId)
  assert.equal(headers.timestamp, FIXED.timestamp)
  assert.equal(headers.nonce, FIXED.nonce)
  assert.equal(headers.sign, giga.buildSignature(FIXED))
})

await check('headers reject a non-10-digit nonce', () => {
  assert.throws(() => giga.buildHeaders({ ...FIXED, now: () => 1700000000000, nonceFactory: () => 12345 }), /10-digit/)
})

await check('headers reject a non-13-digit timestamp', () => {
  assert.throws(() => giga.buildHeaders({ ...FIXED, now: () => 1700000000, nonceFactory: () => 1234567890 }), /13-digit/)
})

await check('base URL defaults to production and accepts the sandbox', () => {
  clearGigaEnv()
  assert.equal(giga.resolveBaseUrl({}), 'https://openapi.gigab2b.com')
  assert.equal(giga.resolveBaseUrl({ environment: 'sandbox' }), 'https://openapi-sandbox.gigab2b.com')
  assert.equal(giga.resolveBaseUrl({ baseUrl: 'https://openapi.gigab2b.com/' }), 'https://openapi.gigab2b.com')
})

await check('base URL rejects the retired Open API 1.0 host', () => {
  clearGigaEnv()
  assert.throws(() => giga.resolveBaseUrl({ baseUrl: 'https://api.gigacloudlogistics.com' }), /retired/)
})

await check('base URL rejects unknown hosts', () => {
  clearGigaEnv()
  assert.throws(() => giga.resolveBaseUrl({ baseUrl: 'https://example.com' }), /Unsupported/)
})

await check('config defaults keep writes disabled', () => {
  clearGigaEnv()
  const cfg = giga.normalizeConfig({})
  assert.equal(cfg.allowWrites, false)
  assert.equal(cfg.maxRetries, 2)
  assert.equal(cfg.timeoutMs, 30000)
  assert.equal(cfg.environment, 'production')
  assert.match(cfg.credentialsFile, /credentials[/\\]giga\.json$/)
})

await check('config only enables writes on an explicit true', () => {
  clearGigaEnv()
  assert.equal(giga.normalizeConfig({ allowWrites: 'yes' }).allowWrites, false)
  assert.equal(giga.normalizeConfig({ allowWrites: true }).allowWrites, true)
})

await check('SKU batches are trimmed, deduplicated and capped at 200', () => {
  assert.deepEqual(giga.validateSkus([' a ', 'b', 'a']), ['a', 'b'])
  assert.throws(() => giga.validateSkus([]), /non-empty/)
  assert.throws(() => giga.validateSkus([' ']), /empty/)
  assert.throws(() => giga.validateSkus(Array.from({ length: 201 }, (_, i) => `S${i}`)), /at most 200/)
})

await check('order number batches are capped at 100', () => {
  assert.deepEqual(giga.validateOrderNos(['A', 'A', 'B']), ['A', 'B'])
  assert.throws(() => giga.validateOrderNos(Array.from({ length: 101 }, (_, i) => `O${i}`)), /at most 100/)
})

await check('page size follows the supplier minimum of 100', () => {
  assert.equal(giga.validatePageSize(undefined), 100)
  assert.equal(giga.validatePageSize(100), 100)
  assert.equal(giga.validatePageSize(1000), 1000)
  assert.throws(() => giga.validatePageSize(99), /between 100 and 1000/)
  assert.throws(() => giga.validatePageSize(1001), /between 100 and 1000/)
})

await check('time filters pass through supplier format and convert ISO to UTC+8', () => {
  assert.equal(giga.toGigaTime('2026-11-01'), '2026-11-01 00:00:00')
  assert.equal(giga.toGigaTime('2026-11-01 12:34:56'), '2026-11-01 12:34:56')
  assert.equal(giga.toGigaTime('2026-11-01T00:00:00Z'), '2026-11-01 08:00:00')
  assert.equal(giga.toGigaTime('2026-11-01T00:00:00+09:00'), '2026-10-31 23:00:00')
  assert.throws(() => giga.toGigaTime('not-a-date'), /not a valid date/)
})

await check('next-arrival fields render a quantity and date range', () => {
  const parsed = giga.parseNextArrival({
    nextArrivalQtyMin: 10,
    nextArrivalQtyMax: 20,
    nextArrivalBegin: '2026-12-01',
    nextArrivalEnd: '2026-12-05',
  })
  assert.equal(parsed.next_arrival_qty_min, 10)
  assert.equal(parsed.next_arrival_qty_max, 20)
  assert.equal(parsed.next_arrival_qty_display, '10~20')
  assert.equal(parsed.next_arrival_date_display, '2026-12-01~2026-12-05')
  assert.equal(giga.parseNextArrival({ nextArrivalQtyMin: 7 }).next_arrival_qty_display, '7')
})

await check('inventory normalization follows the observed 2.0 response shape', () => {
  const record = giga.normalizeInventoryItem({
    sku: 'N515P546649B',
    buyerInventoryInfo: {
      totalBuyerAvailableInventory: 0,
      totalMarginInventory: 3,
      totalFutureInventory: 12,
      currency: 'JPY',
    },
    sellerInventoryInfo: {
      sellerAvailableInventory: 99,
      discountAvailableInventory: 50,
      nextArrivalInventory: { nextArrivalQtyMin: 5, nextArrivalQtyMax: 5, nextArrivalBegin: '2026-12-02' },
    },
  })
  assert.equal(record.sku, 'N515P546649B')
  assert.equal(record.qty_available, 99)
  assert.equal(record.promo_qty, 50)
  assert.equal(record.buyer_available, 0)
  assert.equal(record.margin_qty, 3)
  assert.equal(record.future_qty, 12)
  assert.equal(record.currency, 'JPY')
  assert.equal(record.next_arrival_qty_display, '5')
})

await check('supplier placeholder rows for unknown SKUs are marked not found', () => {
  const inventory = giga.normalizeInventoryItem({
    sku: 'MISSING',
    buyerInventoryInfo: { totalBuyerAvailableInventory: null },
    sellerInventoryInfo: { sellerAvailableInventory: null },
  })
  assert.equal(inventory.found, false)
  const price = giga.normalizePriceItem({ sku: 'MISSING', price: null, skuAvailable: null })
  assert.equal(price.found, false)
  assert.equal(giga.normalizePriceItem({ sku: 'X', skuAvailable: false }).found, true)
  assert.equal(giga.normalizeInventoryItem({ sku: 'Z', sellerInventoryInfo: { sellerAvailableInventory: 0 } }).found, true)
})

await check('price normalization keeps the documented fallback explicit', () => {
  const record = giga.normalizePriceItem({
    sku: 'SKU1',
    currency: 'JPY',
    price: 20000,
    exclusivePrice: null,
    discountedPrice: 13000,
    promotionFrom: '2026-11-16 20:00:00',
    promotionTo: '2026-12-17 05:59:59',
    purchaseLimit: 50,
    shippingFee: 1705,
    skuAvailable: true,
    spotPrice: [],
    sellerInfo: { sellerStore: 'WQ', sellerReturnApprovalRate: 'High' },
  })
  assert.equal(record.unit_price, 20000)
  assert.equal(record.price, 20000)
  assert.equal(record.discounted_price, 13000)
  assert.equal(record.purchase_limit, 50)
  assert.equal(record.spot_price_count, 0)
  assert.equal(record.seller.store, 'WQ')
  assert.equal(record.found, true)
})

await check('product detail hides long content unless requested', () => {
  const fixture = { sku: 'S1', productName: 'Chair', weightKg: 3.2, imageUrls: ['a'], description: 'long', characteristics: ['x'] }
  const compact = giga.normalizeDetailItem(fixture)
  assert.equal(compact.product_name, 'Chair')
  assert.equal(compact.image_urls, undefined)
  assert.equal(compact.description, undefined)
  const full = giga.normalizeDetailItem(fixture, { includeContent: true })
  assert.deepEqual(full.image_urls, ['a'])
  assert.equal(full.description, 'long')
})

await check('rate limiter enforces the 10-second-style sliding window', async () => {
  const limiter = new giga.SlidingWindowLimiter(2, 80)
  const started = Date.now()
  await Promise.all([limiter.acquire(), limiter.acquire(), limiter.acquire(), limiter.acquire()])
  const elapsed = Date.now() - started
  assert.ok(elapsed >= 70, `expected a wait of at least ~75ms, got ${elapsed}ms`)
  assert.ok(elapsed < 1000, `unexpectedly slow limiter: ${elapsed}ms`)
})

await check('API errors carry the supplier code, request id and uncertainty flag', () => {
  const error = new giga.GigaApiError('boom', { code: 'B20002', httpStatus: 200, requestId: 'r1', outcomeUncertain: true })
  assert.equal(error.code, 'B20002')
  assert.equal(error.requestId, 'r1')
  assert.equal(error.outcomeUncertain, true)
  assert.equal(error.name, 'GigaApiError')
})

function fakeContext() {
  const tools = new Map()
  return {
    tools,
    effect: (fn) => fn(),
    toolsRegister: undefined,
    ctx: {
      effect: (fn) => fn(),
      tools: {
        register(tool) {
          tools.set(tool.name, tool)
        },
      },
    },
  }
}

await check('apply registers the eight GigaB2B tools', () => {
  clearGigaEnv()
  const fake = fakeContext()
  apply(fake.ctx, {})
  assert.deepEqual(
    [...fake.tools.keys()].sort(),
    [
      'giga_dropship_sync',
      'giga_inventory',
      'giga_order_status',
      'giga_price',
      'giga_product_detail',
      'giga_products',
      'giga_status',
      'giga_tracking',
    ],
  )
  for (const tool of fake.tools.values()) {
    assert.equal(typeof tool.execute, 'function')
    assert.equal(tool.output.schema.type, 'object')
    assert.equal(typeof tool.presentCall, 'function')
  }
})

await check('status reports actionable setup when credentials are absent', async () => {
  clearGigaEnv()
  const fake = fakeContext()
  apply(fake.ctx, { credentialsFile: '/nonexistent/giga.json' })
  const result = await fake.tools.get('giga_status').execute({})
  assert.equal(result.configured, false)
  assert.equal(result.write_enabled, false)
  assert.ok(Array.isArray(result.setup.steps))
  assert.ok(result.setup.steps.some((step) => /giga-auth\.mjs/.test(step)))
  assert.equal(result.endpoints.length, 7)
})

await check('product list rejects ambiguous or missing time filters before any request', async () => {
  clearGigaEnv()
  const fake = fakeContext()
  apply(fake.ctx, { credentialsFile: '/nonexistent/giga.json' })
  const tool = fake.tools.get('giga_products')
  await assert.rejects(tool.execute({}), /Provide startTime and endTime/)
  await assert.rejects(
    tool.execute({ startTime: '2026-11-01', endTime: '2026-11-02', lastUpdatedAfter: '2026-11-01' }),
    /not both/,
  )
  await assert.rejects(tool.execute({ startTime: '2026-11-02', endTime: '2026-11-01' }), /must not be later/)
  await assert.rejects(tool.execute({ lastUpdatedAfter: '2026-11-01', queryTimeType: 2 }), /only applies/)
  await assert.rejects(
    tool.execute({ lastUpdatedAfter: '2026-11-01', limit: 0 }),
    /limit must be an integer/,
  )
})

await check('writes are refused unless enabled and confirmed', async () => {
  clearGigaEnv()
  const fake = fakeContext()
  apply(fake.ctx, { credentialsFile: '/nonexistent/giga.json' })
  const tool = fake.tools.get('giga_dropship_sync')
  await assert.rejects(tool.execute({ order: { a: 1 }, confirm: true }), /disabled/)
  apply(fake.ctx, { credentialsFile: '/nonexistent/giga.json', allowWrites: true })
  const enabledTool = fake.tools.get('giga_dropship_sync')
  await assert.rejects(enabledTool.execute({ order: { a: 1 }, confirm: false }), /confirm: true/)
})

await check('detail requires exactly one selector', async () => {
  clearGigaEnv()
  const fake = fakeContext()
  apply(fake.ctx, { credentialsFile: '/nonexistent/giga.json' })
  const tool = fake.tools.get('giga_product_detail')
  await assert.rejects(tool.execute({}), /either skus or productNames/)
  await assert.rejects(tool.execute({ skus: ['a'], productNames: ['b'] }), /not both/)
})

const failed = results.filter((entry) => !entry.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
if (failed.length > 0) {
  for (const entry of failed) console.error(`\n${entry.name}:\n${entry.error?.stack ?? entry.error}`)
  process.exit(1)
}
