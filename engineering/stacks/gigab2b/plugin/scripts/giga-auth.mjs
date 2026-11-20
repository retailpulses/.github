#!/usr/bin/env node
/**
 * Store GigaB2B Open API 2.0 client credentials in the plugin folder and verify
 * them with one read-only signed request.
 *
 *   node scripts/giga-auth.mjs                 # prompts (secret hidden)
 *   node scripts/giga-auth.mjs --from-env      # read GIGA_CLIENT_ID / GIGA_CLIENT_SECRET
 *   node scripts/giga-auth.mjs --show          # print status only, never the secret
 *
 * Optional: --client-id=..., --base-url=https://openapi-sandbox.gigab2b.com, --no-verify
 */
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { __internals as giga } from '../index.js'

const { normalizeConfig, postEndpoint, toGigaTime } = giga

const PLUGIN_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_FILE = resolve(PLUGIN_DIR, 'credentials', 'giga.json')

function parseArgs(argv) {
  const options = { fromEnv: false, show: false, verify: true }
  for (const arg of argv) {
    if (arg === '--from-env') options.fromEnv = true
    else if (arg === '--show') options.show = true
    else if (arg === '--no-verify') options.verify = false
    else if (arg.startsWith('--client-id=')) options.clientId = arg.slice('--client-id='.length)
    else if (arg.startsWith('--client-secret=')) options.clientSecret = arg.slice('--client-secret='.length)
    else if (arg.startsWith('--base-url=')) options.baseUrl = arg.slice('--base-url='.length)
    else if (arg.startsWith('--file=')) options.file = arg.slice('--file='.length)
    else if (arg === '--help' || arg === '-h') options.help = true
    else {
      console.error(`Unknown argument: ${arg}`)
      process.exitCode = 2
      options.help = true
    }
  }
  return options
}

function usage() {
  console.log(`Usage: node scripts/giga-auth.mjs [options]

  --from-env            read GIGA_CLIENT_ID and GIGA_CLIENT_SECRET from the environment
  --client-id=<id>      client id (prefer the hidden prompt)
  --client-secret=<s>   client secret (visible in shell history; prefer the hidden prompt)
  --base-url=<url>      production or sandbox Open API 2.0 host (default production)
  --file=<path>         credentials file (default ./credentials/giga.json)
  --no-verify           skip the read-only verification request
  --show                print the current credential status and exit
  -h, --help            show this help`)
}

async function promptVisible(rl, question) {
  const answer = await rl.question(question)
  return answer.trim()
}

async function promptHidden(question) {
  if (!stdin.isTTY) throw new Error('No TTY available for a hidden prompt; use --from-env or --client-secret.')
  stdout.write(question)
  stdin.setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')
  let value = ''
  return new Promise((resolvePromise, reject) => {
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          cleanup()
          stdout.write('\n')
          resolvePromise(value.trim())
          return
        }
        if (char === '\u0003') {
          cleanup()
          stdout.write('\n')
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
    const cleanup = () => {
      stdin.removeListener('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
    }
    stdin.on('data', onData)
  })
}

async function showStatus(file) {
  if (!existsSync(file)) {
    console.log(`No credentials file at ${file}.`)
    return
  }
  const parsed = JSON.parse(await readFile(file, 'utf8'))
  console.log(`Credentials file: ${file}`)
  console.log(`  clientId:     ${parsed.clientId ? `${parsed.clientId.slice(0, 4)}… (${parsed.clientId.length} chars)` : 'missing'}`)
  console.log(`  clientSecret: ${parsed.clientSecret ? `set (${parsed.clientSecret.length} chars)` : 'missing'}`)
  console.log(`  savedAt:      ${parsed.savedAt ?? 'unknown'}`)
}

async function verify(file) {
  const cfg = normalizeConfig({ credentialsFile: file })
  const now = new Date()
  const payload = await postEndpoint(cfg, 'products', {
    page: 1,
    pageSize: 100,
    sort: 4,
    lastUpdatedAfter: toGigaTime(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), 'lastUpdatedAfter'),
  })
  console.log('Verification: OK')
  console.log(`  http:      200`)
  console.log(`  success:   ${payload.success}`)
  console.log(`  code:      ${payload.code ?? ''}`)
  console.log(`  requestId: ${payload.requestId ?? ''}`)
  console.log(`  pageInfo:  ${JSON.stringify(payload.data?.pageInfo ?? null)}`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    usage()
    return
  }
  const file = options.file ? resolve(options.file) : DEFAULT_FILE
  if (options.show) {
    await showStatus(file)
    return
  }

  let clientId = options.clientId
  let clientSecret = options.clientSecret
  if (options.fromEnv) {
    clientId = clientId ?? process.env.GIGA_CLIENT_ID
    clientSecret = clientSecret ?? process.env.GIGA_CLIENT_SECRET
  }

  if (!clientId || !clientSecret) {
    if (!clientId) {
      const rl = createInterface({ input: stdin, output: stdout })
      try {
        clientId = await promptVisible(rl, 'GigaB2B Open API 2.0 Client ID: ')
      } finally {
        rl.close()
      }
    }
    if (!clientSecret) clientSecret = await promptHidden('GigaB2B Open API 2.0 Client Secret (hidden): ')
  }
  if (!clientId || !clientSecret) throw new Error('Both the Client ID and Client Secret are required.')

  await mkdir(dirname(file), { recursive: true, mode: 0o700 })
  await writeFile(
    file,
    `${JSON.stringify({ clientId, clientSecret, savedAt: new Date().toISOString() }, null, 2)}\n`,
    { mode: 0o600 },
  )
  await chmod(file, 0o600).catch(() => {})
  console.log(`Saved credentials to ${file} (mode 0600).`)

  if (options.baseUrl) {
    console.log(`Base URL override kept in the plugin config, not in this file: ${options.baseUrl}`)
  }

  if (options.verify) {
    try {
      await verify(file)
    } catch (error) {
      console.error(`Verification failed: ${error.message}`)
      console.error('Credentials were saved, but the live request failed. Check the Client ID/Secret, the host, and outbound access.')
      process.exitCode = 1
    }
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
