import axios from 'axios'
import https from 'https'
import { randomUUID } from 'crypto'
import {
  XUI_PANEL_URL, XUI_USERNAME, XUI_PASSWORD, XUI_INBOUND_ID,
} from '../config.js'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

let sessionCookie = null

async function login() {
  const loginRes = await axios.post(
    `${XUI_PANEL_URL}/login`,
    new URLSearchParams({ username: XUI_USERNAME, password: XUI_PASSWORD }),
    {
      httpsAgent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  if (!loginRes.data.success) {
    throw new Error('xui login failed: ' + JSON.stringify(loginRes.data))
  }

  const setCookie = loginRes.headers['set-cookie']
  if (setCookie) {
    sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ')
  }
  console.log('xui login ok')
}

function apiHeaders() {
  return {
    Cookie: sessionCookie,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function addClient(client) {
  // 3x-ui ожидает settings как JSON-строку
  const payload = {
    id: XUI_INBOUND_ID,
    settings: JSON.stringify({ clients: [client] }),
  }

  const res = await axios.post(
    `${XUI_PANEL_URL}/panel/api/inbounds/addClient`,
    payload,
    { httpsAgent, headers: apiHeaders() }
  )

  console.log('addClient status:', res.status, 'data:', JSON.stringify(res.data))

  if (!res.data.success) {
    throw new Error('addClient failed: ' + (res.data.msg || JSON.stringify(res.data)))
  }

  return res.data
}

export async function createVlessClient(telegramId, days) {
  if (!sessionCookie) await login()

  const uuid = randomUUID()
  const expiryTime = Date.now() + days * 24 * 60 * 60 * 1000

  const client = {
    id: uuid,
    email: `tg-${telegramId}-${Date.now()}`,
    flow: '',
    totalGB: 0,
    expiryTime,
    enable: true,
    limitIp: 0,
    tgId: String(telegramId),
    subId: randomUUID().replace(/-/g, '').slice(0, 16),
  }

  try {
    await addClient(client)
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.log('xui auth lost, re-login')
      await login()
      await addClient(client)
    } else {
      console.error('addClient failed:', err.response?.status, err.response?.data || err.message)
      throw err
    }
  }

  return { uuid, link: buildVlessLink(uuid, telegramId) }
}

function buildVlessLink(uuid, telegramId) {
  // Схема: клиент → Cloudflare (443/TLS) → origin (2082/ws/no-tls)
  const params = new URLSearchParams({
    type: 'ws',
    security: 'tls',
    sni: 'vpn.widevpn.site',
    host: 'vpn.widevpn.site',
    path: '/vpn',
    fp: 'chrome',
  })
  return `vless://${uuid}@vpn.widevpn.site:443?${params.toString()}#WIGE-${telegramId}`
}