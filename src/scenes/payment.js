import { InlineKeyboard } from 'grammy'
import { createSubscription } from '../db/queries.js'
import { createVlessClient } from '../xui/client.js'
import { createPayment, getPaymentStatus } from '../yookassa/client.js'

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const tariffs = {
  payment_1_month: { days: 30, price: 149, label: '1 месяц' },
  payment_3_months: { days: 90, price: 399, label: '3 месяца' },
  payment_6_months: { days: 180, price: 699, label: '6 месяцев' },
  payment_1_year: { days: 365, price: 990, label: '1 год' },
}

const POLL_INTERVAL_MS = 5000
const POLL_MAX_ATTEMPTS = 120
const activePolls = new Set()

async function waitForPayment(bot, telegramId, paymentId, tariff) {
  if (activePolls.has(paymentId)) return
  activePolls.add(paymentId)

  let attempts = 0
  const interval = setInterval(async () => {
    attempts++

    try {
      const status = await getPaymentStatus(paymentId)

      if (status === 'succeeded') {
        clearInterval(interval)
        activePolls.delete(paymentId)
        try {
          const { uuid, link } = await createVlessClient(telegramId, tariff.days)
          const sub = await createSubscription(telegramId, link, uuid, tariff.days)
          await bot.api.sendMessage(telegramId, `✅ Оплата принята!

🔑 Ваш ключ (нажмите, чтобы скопировать):
<code>${escapeHtml(sub.key)}</code>

📅 Действует до: ${new Date(sub.expires_at).toLocaleString('ru-RU')}`, {
            parse_mode: 'HTML',
            reply_markup: new InlineKeyboard()
              .text('Подключить устройство', 'connect').row()
              .text('Главное меню', 'goto_menu')
          })
        } catch (e) {
          console.error('issue key failed:', e.message)
        }
        return
      }

      if (status === 'canceled') {
        clearInterval(interval)
        activePolls.delete(paymentId)
        try { await bot.api.sendMessage(telegramId, '❌ Оплата отменена.') } catch {}
        return
      }
    } catch (err) {
      console.error('poll error:', err.message)
    }

    if (attempts >= POLL_MAX_ATTEMPTS) {
      clearInterval(interval)
      activePolls.delete(paymentId)
    }
  }, POLL_INTERVAL_MS)
}

export function paymentScene(bot) {
  bot.callbackQuery('extend', async (ctx) => {
    try { await ctx.answerCallbackQuery() } catch {}
    try {
      await ctx.editMessageText(`Выберите срок подписки.

После оплаты вы получите ссылку на активацию VPN.
Скидка при покупке на год 30%!`, {
        reply_markup: new InlineKeyboard()
          .text('1 месяц - 149 ₽', 'payment_1_month').row()
          .text('3 месяца - 399 ₽', 'payment_3_months').row()
          .text('6 месяцев - 699 ₽', 'payment_6_months').row()
          .text('1 год - 990 ₽ (скидка 30%)', 'payment_1_year').row()
          .text('Назад', 'main_menu')
      })
    } catch (err) {
      if (!err.description?.includes('not modified')) console.error('extend edit:', err.message)
    }
  })

  bot.callbackQuery(/^payment_/, async (ctx) => {
    try { await ctx.answerCallbackQuery() } catch {}
    const key = ctx.callbackQuery.data
    const tariff = tariffs[key]
    if (!tariff) return

    try {
      const payment = await createPayment(
        tariff.price,
        `Подписка VPN — ${tariff.label}`,
        { telegram_id: ctx.from.id, tariff: key },
        `https://t.me/${ctx.me.username}`
      )

      await ctx.editMessageText(`💳 Оплата: ${tariff.label} — ${tariff.price} ₽

Нажмите кнопку ниже, чтобы оплатить. После оплаты ключ придёт автоматически.`, {
        reply_markup: new InlineKeyboard()
          .url('Оплатить', payment.confirmationUrl).row()
          .text('Назад', 'extend')
      })

      waitForPayment(bot, ctx.from.id, payment.id, tariff)
    } catch (err) {
      console.error('createPayment:', err.response?.data || err.message)
      try { await ctx.reply('Не получилось создать платёж, попробуйте позже.') } catch {}
    }
  })
}
