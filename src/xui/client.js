import axios from 'axios'
import { randomUUID, randomBytes } from 'crypto'
import {
  XUI_PANEL_URL, XUI_USERNAME, XUI_PASSWORD, XUI_INBOUND_ID,
  SERVER_IP, SERVER_PORT, XUI_PUBLIC_KEY, XUI_SHORT_ID, XUI_SNI
} from '../config.js'

let sessionCookie = null
let csrfToken = null

async function login() {
  const pageRes = await axios.get(`${XUI_PANEL_URL}/`)
  const anonCookie = pageRes.headers['set-cookie']?.[0]?.split(';')[0]

  const match = pageRes.data.match(/<meta name="csrf-token" content="([^"]+)"/)
  if (!match) throw new Error('Не нашли csrf-token в HTML страницы логина — панель могла обновиться')
  csrfToken = match[1]

  const loginRes = await axios.post(
    `${XUI_PANEL_URL}/login`,
    new URLSearchParams({ username: XUI_USERNAME, password: XUI_PASSWORD }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Csrf-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        ...(anonCookie ? { Cookie: anonCookie } : {}),
      },
    }
  )

  sessionCookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0] || anonCookie
}

async function addClient(client) {
  await axios.post(
    `${XUI_PANEL_URL}/panel/api/clients/add`,
    { client, inboundIds: [XUI_INBOUND_ID] },
    {
      headers: {
        Cookie: sessionCookie,
        'X-Csrf-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
      },
    }
  )
}

// Создаёт нового клиента в inbound'е и возвращает его UUID + готовую ссылку
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
    flow: '', // пусто — у нас XHTTP, не tcp
    security: 'auto',
    totalGB: 0,
    expiryTime,
    reset: 0,
    resetDay: '',
    resetWeekday: 0,
    resetMax: 0,
    trafficReset: 'never',
    trafficResetDay: 1,
    limitIp: 0,
    limitHwid: 0,
    tgId: '',
    group: '',
    comment: '',
    enable: true,
  }

  try {
    await addClient(client)
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      await login()
      await addClient(client)
    } else {
      throw err
    }
  }

  return { uuid, link: buildVlessLink(uuid, telegramId) }
}

function buildVlessLink(uuid, telegramId) {
  const params = new URLSearchParams({
    type: 'xhttp',
    security: 'reality',
    pbk: XUI_PUBLIC_KEY,
    fp: 'chrome',
    sni: XUI_SNI,
    sid: XUI_SHORT_ID,
    mode: 'auto',
    path: '/',
    encryption: 'none',
  })
  return `vless://${uuid}@${SERVER_IP}:${SERVER_PORT}?${params.toString()}#user-${telegramId}`
}
