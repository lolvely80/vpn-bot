import axios from 'axios'
import https from 'https'
import { randomUUID, randomBytes } from 'crypto'
import {
  XUI_PANEL_URL, XUI_USERNAME, XUI_PASSWORD, XUI_INBOUND_ID,
  SERVER_IP, SERVER_PORT, XUI_PUBLIC_KEY, XUI_SHORT_ID, XUI_SNI
} from '../config.js'

// панель на самоподписанном сертификате — отключаем проверку
const httpsAgent = new https.Agent({ rejectUnauthorized: false })

let sessionCookie = null
let csrfToken = null

async function login() {
  const pageRes = await axios.get(`${XUI_PANEL_URL}/`, { httpsAgent })
  const anonCookie = pageRes.headers['set-cookie']?.[0]?.split(';')[0]

  const match = pageRes.data.match(/<meta name="csrf-token" content="([^"]+)"/)
  if (!match) throw new Error('csrf-token не найден на странице логина')
  csrfToken = match[1]

  const loginRes = await axios.post(
    `${XUI_PANEL_URL}/login`,
    new URLSearchParams({ username: XUI_USERNAME, password: XUI_PASSWORD }),
    {
      httpsAgent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Csrf-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        ...(anonCookie ? { Cookie: anonCookie } : {}),
      },
    }
  )

  const setCookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0]
  sessionCookie = setCookie || anonCookie
  console.log('xui login ok, cookie:', sessionCookie?.slice(0, 30), 'csrf:', csrfToken?.slice(0, 20))
}

async function addClient(client) {
  const res = await axios.post(
    `${XUI_PANEL_URL}/panel/api/clients/add`,
    { client, inboundIds: [XUI_INBOUND_ID] },
    {
      httpsAgent,
      headers: {
        Cookie: sessionCookie,
        'X-Csrf-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
    }
  )
  console.log('addClient status:', res.status, 'data:', JSON.stringify(res.data))
  return res.data
}

export async function createVlessClient(telegramId, days) {
  if (!sessionCookie) await login()

  const uuid = randomUUID()
  const expiryTime = Date.now() + days * 24 * 60 * 60 * 1000

  const client = {
    email: `tg-${telegramId}-${Date.now()}`,
    subId: randomUUID().replace(/-/g, '').slice(0, 16),
    id: uuid,
    uuid,
    password: randomBytes(8).toString('hex'),
    auth: randomBytes(8).toString('hex'),
    flow: 'xtls-rprx-vision',
    security: 'auto',
    totalGB: 0,
    expiryTime,
    reset: 0,
    resetDay: 0,
    resetWeekday: 0,
    resetMax: 0,
    trafficReset: 'never',
    trafficResetDay: 1,
    limitIp: 0,
    limitHwid: 0,
    tgId: 0,
    group: '',
    comment: '',
    enable: true,
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
  const params = new URLSearchParams({
    type: 'tcp',
    security: 'reality',
    pbk: XUI_PUBLIC_KEY,
    fp: 'chrome',
    sni: XUI_SNI,
    sid: XUI_SHORT_ID,
    flow: 'xtls-rprx-vision',
    encryption: 'none',
  })
  return `vless://${uuid}@${SERVER_IP}:${SERVER_PORT}?${params.toString()}#user-${telegramId}`
}
