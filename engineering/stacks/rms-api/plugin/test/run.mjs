import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { __internals as rms, apply } from '../index.js'

let passed = 0
const failures = []

async function test(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`ok ${passed} - ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.error(`not ok - ${name}`)
    console.error(error)
  }
}

function withEnv(values, fn) {
  const previous = {}
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    })
}

await test('ESA auth header is base64(serviceSecret:licenseKey)', () => {
  assert.equal(rms.buildAuthHeader('abc', 'xyz'), `ESA ${Buffer.from('abc:xyz').toString('base64')}`)
  assert.equal(rms.buildAuthHeader('a', 'b'), 'ESA YTpi')
  assert.throws(() => rms.buildAuthHeader('', 'b'), /missing/)
})

await test('date-only values become JST RMS datetimes', () => {
  assert.equal(rms.normalizeRmsDateTime('2026-11-20'), '2026-11-20T00:00:00+0900')
  assert.equal(rms.normalizeRmsDateTime('2026-11-20', true), '2026-11-20T23:59:59+0900')
})

await test('ISO datetimes are converted to JST', () => {
  assert.equal(rms.normalizeRmsDateTime('2026-11-20T00:00:00Z'), '2026-11-20T09:00:00+0900')
  assert.equal(rms.normalizeRmsDateTime('2026-11-20 10:30:00'), '2026-11-20T10:30:00+0900')
})

await test('order range rejects reversed and >31 day windows', () => {
  assert.throws(
    () => rms.normalizeOrderRange({ start: '2026-11-20', end: '2026-11-19' }),
    /after the start/,
  )
  assert.throws(
    () => rms.normalizeOrderRange({ start: '2026-01-01', end: '2026-02-15' }),
    /at most 31 days/,
  )
  assert.deepEqual(rms.normalizeOrderRange({ start: '2026-11-01', end: '2026-11-20' }), {
    startDatetime: '2026-11-01T00:00:00+0900',
    endDatetime: '2026-11-20T23:59:59+0900',
  })
})

await test('order search payload carries progress and pagination', () => {
  const payload = rms.buildOrderSearchPayload({ start: '2026-11-01', end: '2026-11-20', progress: [100, 300] }, 100, 2)
  assert.equal(payload.dateType, 1)
  assert.deepEqual(payload.orderProgressList, [100, 300])
  assert.deepEqual(payload.PaginationRequestModel, { requestRecordsAmount: 100, requestPage: 2 })
  assert.throws(() => rms.buildOrderSearchPayload({ progress: [123] }, 10, 1), /Unknown order progress/)
})

await test('item search results are compacted without descriptions', () => {
  const payload = {
    offset: 0,
    numFound: 1,
    results: [{
      item: {
        manageNumber: 'mn-1',
        itemNumber: 'item-1',
        title: 'A title',
        genreId: '123',
        variants: {
          v1: { standardPrice: '1000', merchantDefinedSkuId: 'sku-1', selectorValues: { color: 'red' } },
        },
        productDescription: { pc: 'x'.repeat(100000) },
      },
    }],
  }
  const normalized = rms.normalizeItemSearch(payload, 0)
  assert.equal(normalized.numFound, 1)
  assert.equal(normalized.items[0].manageNumber, 'mn-1')
  assert.equal(normalized.items[0].variantCount, 1)
  assert.equal(normalized.items[0].variants[0].price, '1000')
  assert.equal(normalized.items[0].productDescription, undefined)
})

await test('write access requires config and per-call confirmation', () => {
  assert.throws(() => rms.requireWriteAccess({ allowWrites: false }, { confirm: true }, 'Test write'), /disabled/)
  assert.throws(() => rms.requireWriteAccess({ allowWrites: true }, {}, 'Test write'), /confirm: true/)
  assert.doesNotThrow(() => rms.requireWriteAccess({ allowWrites: true }, { confirm: true }, 'Test write'))
})

await test('shipping rows are validated', () => {
  const rows = rms.validateShippingList([{ shippingId: 1, shippingCompanyId: 2, shippingNumber: '1234' }])
  assert.deepEqual(rows, [{ shippingId: 1, shippingCompanyId: 2, shippingNumber: '1234' }])
  assert.throws(() => rms.validateShippingList([]), /at least one/)
  assert.throws(() => rms.validateShippingList([{ shippingId: 1, shippingCompanyId: 0, shippingNumber: 'x' }]), /shippingCompanyId/)
})

await test('variant requests are validated', () => {
  assert.deepEqual(
    rms.normalizeVariantRequests([{ manageNumber: 'mn', variantId: 'v1' }], 100),
    [{ manageNumber: 'mn', variantId: 'v1' }],
  )
  assert.throws(() => rms.normalizeVariantRequests([{ manageNumber: 'mn' }], 100), /variantId/)
  assert.throws(() => rms.normalizeVariantRequests([], 100), /At least one/)
})

await test('secrets are redacted from error text', () => {
  const settings = { serviceSecret: 'secret-value', licenseKey: 'license-value' }
  const token = Buffer.from('secret-value:license-value').toString('base64')
  assert.equal(
    rms.redact(`bad secret-value and license-value and ${token}`, settings),
    'bad [REDACTED] and [REDACTED] and [REDACTED]',
  )
})

await test('base URL is locked to the RMS host', () => {
  assert.equal(rms.normalizeConfig({}).baseUrl, undefined)
  assert.throws(() => rms.normalizeConfig({ baseUrl: 'https://example.com' }), /must be/)
  assert.doesNotThrow(() => rms.normalizeConfig({ baseUrl: 'https://api.rms.rakuten.co.jp/' }))
})

await test('credential precedence is config, env, file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rms-plugin-'))
  const file = join(dir, 'rms.json')
  await writeFile(file, JSON.stringify({ serviceSecret: 'file-secret', licenseKey: 'file-license' }))
  try {
    await withEnv({ RAKUTEN_SERVICE_SECRET: 'env-secret', RAKUTEN_LICENSE_KEY: undefined }, async () => {
      const fromEnv = await rms.resolveSettings(rms.normalizeConfig({ credentialsFile: file }))
      assert.equal(fromEnv.serviceSecret, 'env-secret')
      assert.equal(fromEnv.sources.serviceSecret, 'env')
      assert.equal(fromEnv.licenseKey, 'file-license')
      assert.equal(fromEnv.sources.licenseKey, 'file')

      const fromConfig = await rms.resolveSettings(
        rms.normalizeConfig({ credentialsFile: file, serviceSecret: 'cfg-secret', licenseKey: 'cfg-license' }),
      )
      assert.equal(fromConfig.serviceSecret, 'cfg-secret')
      assert.equal(fromConfig.sources.serviceSecret, 'config')
      assert.equal(fromConfig.licenseKey, 'cfg-license')
    })
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

await test('apply registers all tools and keeps writes non-concurrent', () => {
  const tools = []
  const ctx = { effect: (fn) => fn(), tools: { register: (tool) => tools.push(tool) } }
  apply(ctx, { allowWrites: false })
  assert.equal(tools.length, 12)
  assert.deepEqual(tools.map((tool) => tool.name), [
    'rms_status',
    'rms_orders_search',
    'rms_order_detail',
    'rms_order_confirm',
    'rms_order_shipping',
    'rms_order_cancel',
    'rms_items_search',
    'rms_item_detail',
    'rms_item_price',
    'rms_inventory',
    'rms_inventory_range',
    'rms_inventory_update',
  ])
  const writes = new Set([
    'rms_order_confirm',
    'rms_order_shipping',
    'rms_order_cancel',
    'rms_item_price',
    'rms_inventory_update',
  ])
  for (const tool of tools) {
    assert.equal(tool.isConcurrencySafe(), !writes.has(tool.name))
    assert.equal(tool.parameters.type, 'object')
  }
})

if (failures.length > 0) {
  console.error(`\n${failures.length} test(s) failed.`)
  process.exitCode = 1
} else {
  console.log(`\n${passed} tests passed.`)
}
