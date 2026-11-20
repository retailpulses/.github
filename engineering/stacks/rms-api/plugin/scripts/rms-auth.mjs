#!/usr/bin/env node
/**
 * Store Rakuten RMS WEB SERVICE credentials in the plugin folder and verify
 * them with one read-only Item API request.
 *
 *   node scripts/rms-auth.mjs                    # prompts (secrets hidden)
 *   node scripts/rms-auth.mjs --from-env         # RAKUTEN_SERVICE_SECRET / RAKUTEN_LICENSE_KEY
 *   node scripts/rms-auth.mjs --from-file=path   # read the two keys from an env file
 *   node scripts/rms-auth.mjs --show             # status only, never the secrets
 *
 * Optional: --no-verify, --file=<credentials.json>
 */
import { existsSync } from 'node:fs'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { __internals as rms } from '../index.js'

const { normalizeConfig, probeItemSearch } = rms

const PLUGIN_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_FILE = resolve(PLUGIN_DIR, 'credentials', 'rms.json')
const KEY_NAMES = ['RAKUTEN_SERVICE_SECRET', 'RAKUTEN_LICENSE_KEY']

function parseArgs(argv) {
  const options = { fromEnv: false, show: false, verify: true }
  for (const arg of argv) {
    if (arg === '--from-env') options.fromEnv = true
    else if (arg === '--show') options.show = true
    else if (arg === '--no-verify') options.verify = false
    else if (arg.startsWith('--from-file=')) options.fromFile = arg.slice('--from-file='.length)
    else if (arg.startsWith('--file=')) options.file = arg.slice('--file='.length)
    else if (arg.startsWith('--service-secret=')) options.serviceSecret = arg.slice('--service-secret='.length)
    else if (arg.startsWith('--license-key=')) options.licenseKey = arg.slice('--license-key='.length)
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
  console.log(`Usage: node scripts/rms-auth.mjs [options]

  --from-env                 read RAKUTEN_SERVICE_SECRET and RAKUTEN_LICENSE_KEY
  --from-file=<path>         read those two keys from an env-style file
  --service-secret=<value>   visible in shell history; prefer the prompt/from-file
  --license-key=<value>      visible in shell history; prefer the prompt/from-file
  --file=<path>              credentials JSON path (default ./credentials/rms.json)
  --no-verify                skip the read-only Item API verification
  --show                     print current credential status and exit
  -h, --help                 show this help

RMS issues serviceSecret for the registered app and licenseKey for the shop.
The file is written with mode 0600 and is git-ignored.`)
}

function parseEnvFile(text) {
  const values = {}
  for (const line of text.split(/\r?\n/)) {
    const match = /^(RAKUTEN_SERVICE_SECRET|RAKUTEN_LICENSE_KEY)=(.*)$/.exec(line.trim())
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    values[match[1]] = value
  }
  return values
}

async function promptVisible(rl, question) {
  const answer = await rl.question(question)
  return answer.trim()
}

async function promptHidden(question) {
  if (!stdin.isTTY) throw new Error('No TTY available for a hidden prompt; use --from-env or --from-file.')
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
    console.log(`Environment fallback: ${KEY_NAMES.join(', ')}.`)
    return
  }
  const parsed = JSON.parse(await readFile(file, 'utf8'))
  console.log(`Credentials file: ${file}`)
  console.log(`  serviceSecret: ${parsed.serviceSecret ? `set (${parsed.serviceSecret.length} chars)` : 'missing'}`)
  console.log(`  licenseKey:    ${parsed.licenseKey ? `set (${parsed.licenseKey.length} chars)` : 'missing'}`)
  console.log(`  savedAt:       ${parsed.savedAt ?? 'unknown'}`)
}

async function verify(file) {
  const cfg = normalizeConfig({ credentialsFile: file, timeoutMs: 30000, minIntervalMs: 0 })
  const probe = await probeItemSearch(cfg)
  console.log('Verification: OK')
  console.log(`  http:      ${probe.httpStatus}`)
  console.log(`  numFound:  ${probe.numFound}`)
  console.log(`  requestId: ${probe.requestId ?? ''}`)
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

  let serviceSecret = options.serviceSecret
  let licenseKey = options.licenseKey

  if (options.fromEnv) {
    serviceSecret = serviceSecret ?? process.env.RAKUTEN_SERVICE_SECRET
    licenseKey = licenseKey ?? process.env.RAKUTEN_LICENSE_KEY
  }
  if (options.fromFile) {
    const text = await readFile(resolve(options.fromFile), 'utf8')
    const values = parseEnvFile(text)
    serviceSecret = serviceSecret ?? values.RAKUTEN_SERVICE_SECRET
    licenseKey = licenseKey ?? values.RAKUTEN_LICENSE_KEY
  }

  if (!serviceSecret || !licenseKey) {
    if (!stdin.isTTY && !serviceSecret) {
      throw new Error('Not a TTY. Use --from-env or --from-file=<env-file> for non-interactive setup.')
    }
    if (!serviceSecret) {
      const rl = createInterface({ input: stdin, output: stdout })
      try {
        serviceSecret = await promptHidden('Rakuten RMS serviceSecret (hidden): ')
      } finally {
        rl.close()
      }
    }
    if (!licenseKey) licenseKey = await promptHidden('Rakuten RMS licenseKey (hidden): ')
  }
  if (!serviceSecret || !licenseKey) throw new Error('Both serviceSecret and licenseKey are required.')

  await mkdir(dirname(file), { recursive: true, mode: 0o700 })
  await writeFile(
    file,
    `${JSON.stringify({ version: 1, serviceSecret, licenseKey, savedAt: new Date().toISOString() }, null, 2)}\n`,
    { mode: 0o600 },
  )
  await chmod(file, 0o600).catch(() => {})
  console.log(`Saved RMS credentials to ${file} (mode 0600).`)

  if (options.verify) {
    try {
      await verify(file)
    } catch (error) {
      console.error(`Verification failed: ${error.message}`)
      console.error('Credentials were saved, but the live request failed. Check the keys, the shop subscription, and outbound access.')
      process.exitCode = 1
    }
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
