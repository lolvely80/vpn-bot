import axios from 'axios'
import { randomUUID } from 'crypto'
import { YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY } from '../config.js'

const auth = {
  username: YOOKASSA_SHOP_ID,
  password: YOOKASSA_SECRET_KEY,
}

// Создаёт платёж и возвращает { id, confirmationUrl, status }
export async function createPayment(amount, description, metadata, returnUrl) {
  const res = await axios.post(
    'https://api.yookassa.ru/v3/payments',
    {
      amount: { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: returnUrl },
      capture: true,
      description,
      metadata,
    },
    {
      auth,
      headers: {
        'Idempotence-Key': randomUUID(),
        'Content-Type': 'application/json',
      },
    }
  )

  return {
    id: res.data.id,
    confirmationUrl: res.data.confirmation.confirmation_url,
    status: res.data.status,
  }
}

// Возвращает текущий статус платежа: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
export async function getPaymentStatus(paymentId) {
  const res = await axios.get(`https://api.yookassa.ru/v3/payments/${paymentId}`, { auth })
  return res.data.status
}
