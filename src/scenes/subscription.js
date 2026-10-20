import { InlineKeyboard } from 'grammy'
import { getSubscription, getUser } from '../db/queries.js'

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function subscriptionScene(bot) {
  bot.callbackQuery('subscription', async (ctx) => {
    const sub = await getSubscription(ctx.from.id)

    if (!sub) {
      return ctx.editMessageText(`👤 Профиль:
📝 Имя: ${ctx.from.first_name}
🆔 ${ctx.from.id}

У вас пока нет активной подписки.`, {
        reply_markup: new InlineKeyboard()
          .text('Продлить подписку', 'extend').row()
          .text('Назад', 'main_menu').row()
      })
    }

    ctx.editMessageText(`👤 Профиль:
📝 Имя: ${ctx.from.first_name}
🆔 ${ctx.from.id}
💳 Баланс: 0 ₽

🔑 Ваша подписка (нажмите, чтобы скопировать):
<code>${escapeHtml(sub.key)}</code>

📅 Срок действия: ${new Date(sub.expires_at).toLocaleDateString('ru-RU')}

💡 Используйте кнопки ниже для управления подпиской`, {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard()
        .text('Продлить подписку', 'extend').row()
        .text('Назад', 'main_menu').row()
    })
  })
}
