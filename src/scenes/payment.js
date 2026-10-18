import { InlineKeyboard } from 'grammy'
import { createSubscription } from '../db/queries.js'

const tariffs = {
  payment_1_month: { days: 30, price: 149, label: '1 месяц' },
  payment_3_months: { days: 90, price: 399, label: '3 месяца' },
  payment_6_months: { days: 180, price: 699, label: '6 месяцев' },
  payment_1_year: { days: 365, price: 990, label: '1 год' },
}

export function paymentScene(bot) {
  bot.callbackQuery('extend', (ctx) => {
    ctx.editMessageText(`Выберите срок подписки.

После оплаты вы получите ссылку на активацию VPN.
Скидка при покупке на год 30%!`, {
      reply_markup: new InlineKeyboard()
        .text('1 месяц - 149 ₽', 'payment_1_month').row()
        .text('3 месяца - 399 ₽', 'payment_3_months').row()
        .text('6 месяцев - 699 ₽', 'payment_6_months').row()
        .text('1 год - 990 ₽ (скидка 30%)', 'payment_1_year').row()
        .text('Назад', 'main_menu')
    })
  })

  bot.callbackQuery(/^payment_/, async (ctx) => {
    const tariff = tariffs[ctx.callbackQuery.data]
    await ctx.editMessageText(`💳 Оплата: ${tariff.label} — ${tariff.price} ₽

Переведите на карту:
2200 7007 1234 5678
После оплаты нажмите кнопку ниже.`, {
      reply_markup: new InlineKeyboard()
        .text('✅ Я оплатил', ctx.callbackQuery.data.replace('payment_', 'confirm_')).row()
        .text('Назад', 'extend')
    })
  })

  bot.callbackQuery(/^confirm_/, async (ctx) => {
    const key = ctx.callbackQuery.data.replace('confirm_', 'payment_')
    const tariff = tariffs[key]
    const sub = await createSubscription(ctx.from.id, tariff.days)

    await ctx.editMessageText(`✅ Оплата принята!

🔑 Ваш ключ:
${sub.key}

📅 Действует до: ${new Date(sub.expires_at).toLocaleString('ru-RU')}`, {
      reply_markup: new InlineKeyboard()
        .text('Подключить устройство', 'connect').row()
        .text('Главное меню', 'goto_menu')
    })
  })
}