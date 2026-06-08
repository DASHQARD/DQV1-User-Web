#!/usr/bin/env node
/**
 * Smoke-test GET /guest-carts and GET /guest-carts/items against staging (or .env base URL).
 *
 * Usage:
 *   npm run smoke:guest-carts
 *   GUEST_ACCESS_TOKEN='<jwt>' npm run smoke:guest-carts
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(root, '.env')
  if (!existsSync(envPath)) return {}
  const out = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).replace(/^["']|["']$/g, '')
  }
  return out
}

const env = loadEnv()
const nodeEnv = env.VITE_NODE_ENV || 'staging'
const base =
  (nodeEnv === 'staging' ? env.VITE_STAGING_BASE_URL : null) ||
  env.VITE_DEVELOPMENT_BASE_URL ||
  env.VITE_API_BASE_URL ||
  'https://staging-api.dashqard.com'

const token = process.env.GUEST_ACCESS_TOKEN?.trim()
const apiRoot = `${base.replace(/\/$/, '')}/api/v1`

async function fetchJson(path) {
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const url = `${apiRoot}${path}`
  const res = await fetch(url, { headers })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { url, status: res.status, body }
}

console.log(`API: ${apiRoot}`)
console.log(`Auth: ${token ? 'Bearer token set' : 'none (expect 401)'}\n`)

for (const path of ['/guest-carts', '/guest-carts/items']) {
  const result = await fetchJson(path)
  console.log(`--- GET ${path} ---`)
  console.log(`URL: ${result.url}`)
  console.log(`Status: ${result.status}`)
  console.log(JSON.stringify(result.body, null, 2))
  console.log('')
}

if (!token) {
  console.log(
    'Tip: After guest OTP in the app, copy access token from localStorage (auth store) and run:\n' +
      '  GUEST_ACCESS_TOKEN="..." npm run smoke:guest-carts',
  )
}
