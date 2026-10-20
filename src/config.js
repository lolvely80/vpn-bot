import 'dotenv/config'

export const BOT_TOKEN = process.env.BOT_TOKEN
export const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(Number)

export const XUI_PANEL_URL = process.env.XUI_PANEL_URL
export const XUI_USERNAME = process.env.XUI_USERNAME
export const XUI_PASSWORD = process.env.XUI_PASSWORD
export const XUI_INBOUND_ID = Number(process.env.XUI_INBOUND_ID)

export const SERVER_IP = process.env.SERVER_IP
export const SERVER_PORT = Number(process.env.SERVER_PORT)
export const XUI_PUBLIC_KEY = process.env.XUI_PUBLIC_KEY
export const XUI_SHORT_ID = process.env.XUI_SHORT_ID
export const XUI_SNI = process.env.XUI_SNI

export const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
export const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY
