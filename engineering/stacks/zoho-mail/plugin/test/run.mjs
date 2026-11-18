// Mock Zoho Mail API + end-to-end checks for the plugin's tool implementations.
// Run: node test/run.mjs
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, writeFile, readFile, stat, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../index.js'

const ACCOUNT_ID = '2560636000000008002'
const MESSAGE_ID = '1709876190693100009'
const ATTACHMENT_ID = '138907275303090130'

const requests = []
let lastUpdateBody = ''
let lastSendBody = null
let uploadCount = 0
let scopeLimited = false

function json(response, payload, status = 200) {
  const body = JSON.stringify(payload)
  response.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) })
  response.end(body)
}

const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1')
  const chunks = []
  request.on('data', (chunk) => chunks.push(chunk))
  request.on('end', () => {
    const body = Buffer.concat(chunks)
    requests.push({ method: request.method, path: url.pathname, query: url.search, body: body.toString('utf8') })

    if (url.pathname === '/oauth/v2/token') {
      const params = new URLSearchParams(body.toString())
      if (params.get('grant_type') === 'authorization_code') {
        return json(response, {
          access_token: 'access-connect',
          refresh_token: 'refresh-connect',
          expires_in: 3600,
          scope: 'ZohoMail.accounts.READ,ZohoMail.messages.ALL,ZohoMail.folders.ALL',
        })
      }
      return json(response, { access_token: 'access-test', refresh_token: 'refresh-ignored', expires_in: 3600 })
    }

    if (url.pathname === '/api/accounts') {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: [
          {
            accountId: ACCOUNT_ID,
            primaryEmailAddress: 'me@example.com',
            mailboxAddress: 'me@example.com',
            displayName: 'Me',
            zuid: '809451734',
            usedStorage: 1024,
            planStorage: 10240,
            emailAddress: [
              { mailId: 'me@example.com', isPrimary: true, isAlias: false },
              { mailId: 'alias@example.com', isPrimary: false, isAlias: true },
            ],
          },
        ],
      })
    }

    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/folders`) {
      if (scopeLimited) return json(response, { status: { code: 401, description: 'INVALID_OAUTHSCOPE' } }, 401)
      return json(response, {
        status: { code: 200, description: 'success' },
        data: [
          { folderId: '100', folderName: 'Inbox', folderType: 'Inbox', path: '/Inbox' },
          { folderId: '200', folderName: 'Sent', folderType: 'Sent', path: '/Sent' },
          { folderId: '300', folderName: 'Archive', folderType: 'Archive', path: '/Archive' },
          { folderId: '400', folderName: 'Trash', folderType: 'Trash', path: '/Trash' },
        ],
      })
    }

    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/messages/view`) {
      const folderId = url.searchParams.get('folderId')
      if (scopeLimited && folderId) {
        return json(response, { status: { code: 401, description: 'INVALID_OAUTHSCOPE' } }, 401)
      }
      const data =
        folderId === '100' || (scopeLimited && !folderId)
          ? [
              {
                messageId: MESSAGE_ID,
                folderId: '100',
                threadId: '1709876190693100001',
                subject: 'Hello from Alice',
                fromAddress: 'alice@example.com',
                sender: 'Alice',
                toAddress: 'me@example.com',
                receivedTime: '1709876190649',
                status: '0',
                hasAttachment: '1',
                summary: 'Hi there',
                size: '1024',
                flagid: 'flag_not_set',
              },
            ]
          : []
      return json(response, { status: { code: 200, description: 'success' }, data })
    }

    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/messages/search`) {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: [
          {
            messageId: MESSAGE_ID,
            folderId: '100',
            subject: 'Hello from Alice',
            fromAddress: 'alice@example.com',
            toAddress: 'me@example.com',
            receivedTime: '1709876190649',
            status: '0',
            hasAttachment: '1',
            summary: 'Hi there',
          },
        ],
      })
    }

    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/messages/attachments`) {
      uploadCount += 1
      return json(response, {
        status: { code: 200, description: 'success' },
        data: [{ attachmentName: 'file.txt', attachmentPath: '/compose/file.txt', storeName: '123', attachmentSize: '5' }],
      })
    }

    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/updatemessage`) {
      lastUpdateBody = body.toString('utf8')
      return json(response, { status: { code: 200, description: 'success' } })
    }

    const details = new RegExp(`^/api/accounts/${ACCOUNT_ID}/folders/100/messages/${MESSAGE_ID}/details$`)
    if (details.test(url.pathname)) {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: {
          subject: 'Hello from Alice',
          fromAddress: 'alice@example.com',
          toAddress: 'me@example.com',
          ccAddress: 'Not Provided',
          receivedTime: '1709876190649',
          status: '0',
        },
      })
    }
    if (url.pathname.endsWith(`/messages/${MESSAGE_ID}/content`)) {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: { messageId: MESSAGE_ID, content: '<div>Hi <b>there</b><br>Line 2 &amp; more</div>' },
      })
    }
    if (url.pathname.endsWith(`/messages/${MESSAGE_ID}/attachmentinfo`)) {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: {
          messageId: MESSAGE_ID,
          attachments: [{ attachmentId: ATTACHMENT_ID, attachmentName: 'note.txt', attachmentSize: '5' }],
          inline: [],
        },
      })
    }
    if (url.pathname.endsWith(`/messages/${MESSAGE_ID}/header`)) {
      return json(response, {
        status: { code: 200, description: 'success' },
        data: { messageId: MESSAGE_ID, headerContent: { Subject: ['Hello from Alice'], 'Message-Id': ['<x@example.com>'] } },
      })
    }
    if (url.pathname.endsWith(`/attachments/${ATTACHMENT_ID}`)) {
      const payload = Buffer.from('hello')
      response.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': payload.length })
      return response.end(payload)
    }
    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/messages` && request.method === 'POST') {
      lastSendBody = JSON.parse(body.toString('utf8'))
      return json(response, { status: { code: 200, description: 'success' }, data: { messageId: '1709876190693100999' } })
    }
    if (url.pathname === `/api/accounts/${ACCOUNT_ID}/messages/${MESSAGE_ID}` && request.method === 'POST') {
      lastSendBody = JSON.parse(body.toString('utf8'))
      return json(response, { status: { code: 200, description: 'success' } })
    }
    if (request.method === 'DELETE' && url.pathname.includes('/messages/')) {
      return json(response, { status: { code: 200, description: 'success' }, data: { cId: '1' } })
    }
    return json(response, { status: { code: 404, description: `no mock for ${request.method} ${url.pathname}` } }, 404)
  })
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const work = await mkdtemp(join(tmpdir(), 'zoho-mail-test-'))
const credentialsFile = join(work, 'zoho.json')
const downloadsDir = join(work, 'downloads')
const attachmentFile = join(work, 'file.txt')
await writeFile(attachmentFile, 'hello')
await writeFile(
  credentialsFile,
  JSON.stringify({ version: 1, region: 'com', clientId: 'client-id', clientSecret: 'client-secret', refreshToken: 'refresh-token' }),
  { mode: 0o600 },
)

function loadTools(config) {
  const registered = new Map()
  apply(
    {
      effect(fn) {
        fn()
      },
      tools: {
        register(tool) {
          registered.set(tool.name, tool)
        },
      },
    },
    config,
  )
  return registered
}

const tools = loadTools({
  apiBase: base,
  accountsBase: base,
  credentialsFile,
  downloadsDir,
  maxResults: 10,
})
assert.equal(tools.size, 9, 'all nine tools register')
console.log('✓ registered:', [...tools.keys()].join(', '))

// status
const status = await tools.get('zoho_mail_status').execute({}, {})
assert.equal(status.configured, true)
assert.equal(status.authenticated, true)
assert.equal(status.account.primaryEmail, 'me@example.com')
assert.equal(status.folderCount, 4)
console.log('✓ status')

// folders
const folders = await tools.get('zoho_mail_folders').execute({}, {})
assert.equal(folders.folders.find((folder) => folder.type === 'Inbox').id, '100')
console.log('✓ folders')

// list
const list = await tools.get('zoho_mail_list').execute({ folder: 'inbox', unreadOnly: true }, {})
assert.equal(list.count, 1)
assert.equal(list.messages[0].unread, true)
assert.equal(list.messages[0].hasAttachment, true)
assert.equal(list.messages[0].receivedAt, new Date(1709876190649).toISOString())
console.log('✓ list')

// search
const search = await tools.get('zoho_mail_search').execute({ searchKey: 'from:alice@example.com' }, {})
assert.equal(search.count, 1)
assert.equal(search.messages[0].subject, 'Hello from Alice')
console.log('✓ search')

// read (folder located automatically)
const read = await tools.get('zoho_mail_read').execute({ messageId: MESSAGE_ID, includeHeaders: true }, {})
assert.equal(read.folderId, '100')
assert.match(read.text, /Hi there/)
assert.match(read.text, /Line 2 & more/)
assert.equal(read.attachments.length, 1)
assert.equal(read.headers.Subject[0], 'Hello from Alice')
console.log('✓ read')

// attachment list + download
const attachmentList = await tools.get('zoho_mail_attachment').execute({ messageId: MESSAGE_ID }, {})
assert.equal(attachmentList.attachments[0].name, 'note.txt')
const download = await tools.get('zoho_mail_attachment').execute({ messageId: MESSAGE_ID, attachmentId: ATTACHMENT_ID }, {})
assert.equal(download.saved, true)
assert.equal(await readFile(download.path, 'utf8'), 'hello')
assert.equal((await stat(download.path)).mode & 0o777, 0o600)
console.log('✓ attachments')

// send dry run reads the account but never posts a message
const sendPosts = () => requests.filter((entry) => entry.method === 'POST' && entry.path.endsWith('/messages')).length
const before = sendPosts()
const dry = await tools.get('zoho_mail_send').execute({ to: 'bob@example.com', subject: 'Hi', body: 'Body', dryRun: true }, {})
assert.equal(dry.sent, false)
assert.equal(sendPosts(), before)
assert.equal(uploadCount, 0)
console.log('✓ send dryRun')

// send with attachment
const sent = await tools.get('zoho_mail_send').execute(
  { to: 'bob@example.com', cc: 'carol@example.com', subject: 'Hi', body: 'Body', attachments: [attachmentFile] },
  {},
)
assert.equal(sent.sent, true)
assert.equal(uploadCount, 1)
assert.equal(lastSendBody.toAddress, 'bob@example.com')
assert.equal(lastSendBody.attachments[0].storeName, '123')
console.log('✓ send')

// reply
const replied = await tools.get('zoho_mail_send').execute(
  { to: 'alice@example.com', subject: 'Re: Hello', body: 'Thanks', replyToMessageId: MESSAGE_ID },
  {},
)
assert.equal(replied.sent, true)
assert.equal(lastSendBody.action, 'Reply')
console.log('✓ reply')

// update keeps 19-digit ids exact
await tools.get('zoho_mail_update').execute({ action: 'mark_read', messageIds: [MESSAGE_ID] }, {})
assert.equal(lastUpdateBody, `{"mode":"markAsRead","messageId":[${MESSAGE_ID}]}`)
await tools.get('zoho_mail_update').execute({ action: 'move', messageIds: [MESSAGE_ID], destinationFolderId: '300' }, {})
assert.match(lastUpdateBody, /"destfolderId":300/)
console.log('✓ update raw ids')

// delete
const deleted = await tools.get('zoho_mail_update').execute({ action: 'delete', messageIds: [MESSAGE_ID], folderId: '100' }, {})
assert.deepEqual(deleted.deleted, [MESSAGE_ID])
console.log('✓ delete')

// connect flow writes a 0600 credentials file
const connectFile = join(work, 'connect.json')
const connectTools = loadTools({ apiBase: base, accountsBase: base, credentialsFile: connectFile, downloadsDir })
const connected = await connectTools.get('zoho_mail_connect').execute(
  { grantCode: 'grant-code', clientId: 'client-id', clientSecret: 'client-secret', region: 'com' },
  {},
)
assert.equal(connected.connected, true)
assert.equal((await stat(connectFile)).mode & 0o777, 0o600)
const stored = JSON.parse(await readFile(connectFile, 'utf8'))
assert.equal(stored.refreshToken, 'refresh-connect')
const connectedStatus = await connectTools.get('zoho_mail_status').execute({}, {})
assert.equal(connectedStatus.authenticated, true)
console.log('✓ connect + persisted credentials')

// unauthenticated status explains setup without leaking anything
const emptyTools = loadTools({ apiBase: base, accountsBase: base, credentialsFile: join(work, 'missing.json') })
const unauthenticated = await emptyTools.get('zoho_mail_status').execute({}, {})
assert.equal(unauthenticated.configured, false)
assert.ok(unauthenticated.setup.steps.length >= 3)
console.log('✓ unauthenticated guidance')

// A messages-only token (the shape used by the archived mail-integration worker):
// an explicit accountId avoids /accounts, and listing falls back to the folder-less Inbox.
scopeLimited = true
const limitedTools = loadTools({
  apiBase: base,
  accountsBase: base,
  credentialsFile,
  downloadsDir,
  accountId: ACCOUNT_ID,
  email: 'me@example.com',
})
const accountsCallsBefore = requests.filter((entry) => entry.path === '/api/accounts').length
const limitedStatus = await limitedTools.get('zoho_mail_status').execute({}, {})
assert.equal(limitedStatus.authenticated, true)
assert.equal(limitedStatus.mode, 'account-scoped')
assert.equal(limitedStatus.foldersAvailable, false)
assert.ok(limitedStatus.warnings.length >= 1)
assert.equal(requests.filter((entry) => entry.path === '/api/accounts').length, accountsCallsBefore)
console.log('✓ status with messages-only token')

const limitedFolders = await limitedTools.get('zoho_mail_folders').execute({}, {})
assert.equal(limitedFolders.foldersAvailable, false)
assert.equal(limitedFolders.folders.length, 0)
const limitedList = await limitedTools.get('zoho_mail_list').execute({}, {})
assert.equal(limitedList.count, 1)
assert.equal(limitedList.folder.scopeFallback, true)
await assert.rejects(
  () => limitedTools.get('zoho_mail_list').execute({ folder: 'sent' }, {}),
  /only the Inbox is reachable/i,
)
const limitedRead = await limitedTools.get('zoho_mail_read').execute({ messageId: MESSAGE_ID, folderId: '100' }, {})
assert.match(limitedRead.text, /Hi there/)
const limitedSend = await limitedTools.get('zoho_mail_send').execute(
  { to: 'bob@example.com', subject: 'Hi', body: 'Body', dryRun: true },
  {},
)
assert.equal(limitedSend.preview.from, 'me@example.com')
await assert.rejects(
  () => limitedTools.get('zoho_mail_read').execute({ messageId: MESSAGE_ID }, {}),
  /Pass folderId from a zoho_mail_list/i,
)
console.log('✓ messages-only fallback')
scopeLimited = false

// Connect can store the account id/address used by an account-scoped token.
const scopedFile = join(work, 'scoped.json')
const scopedTools = loadTools({ apiBase: base, accountsBase: base, credentialsFile: scopedFile, downloadsDir })
const scopedConnect = await scopedTools.get('zoho_mail_connect').execute(
  {
    grantCode: 'grant-code',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    region: 'com',
    accountId: ACCOUNT_ID,
    email: 'me@example.com',
  },
  {},
)
assert.equal(scopedConnect.accountId, ACCOUNT_ID)
const scopedRecord = JSON.parse(await readFile(scopedFile, 'utf8'))
assert.equal(scopedRecord.accountId, ACCOUNT_ID)
assert.equal(scopedRecord.email, 'me@example.com')
console.log('✓ connect stores account scope')

await rm(work, { recursive: true, force: true })
server.close()
console.log('\nAll Zoho Mail plugin checks passed.')
