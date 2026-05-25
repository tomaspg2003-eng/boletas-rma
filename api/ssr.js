import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let cachedHandler

async function getHandler() {
  if (!cachedHandler) {
    const mod = await import(resolve(__dirname, '../dist/server/server.js'))
    cachedHandler = mod.default
  }
  return cachedHandler
}

export default async function ssr(req, res) {
  const handler = await getHandler()

  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  const url = `${proto}://${host}${req.url}`

  const headers = new Headers()
  for (const [key, val] of Object.entries(req.headers)) {
    if (val !== undefined) {
      headers.set(key, Array.isArray(val) ? val.join(', ') : String(val))
    }
  }

  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    if (chunks.length > 0) body = Buffer.concat(chunks)
  }

  const request = new Request(url, { method: req.method, headers, body })
  const response = await handler.fetch(request)

  res.statusCode = response.status
  response.headers.forEach((val, key) => res.setHeader(key, val))

  const buf = Buffer.from(await response.arrayBuffer())
  res.end(buf)
}
