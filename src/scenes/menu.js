import { InlineKeyboard } from "grammy";
import { getUser, createUser, createTrialSubscription } from '../db/queries.js'
import { createVlessClient } from '../xui/client.js'

// vless-ссылка содержит & — в HTML-разметке Telegram это нужно экранировать,
// иначе сообщение может отрисоваться криво или часть ссылки потеряется
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function menuScene(bot) {
  const menuKeyboard = new InlineKeyboard()
    .text('Подключить устройство', 'connect').row()
    .text('Моя подписка', 'subscription').row()
    .text('Продлить подписку', 'extend').row()
    .text('Поддержка', 'support')

  bot.callbackQuery('main_menu', async (ctx) => {
    const user = await getUser(ctx.from.id)

    if (!user) {
      await createUser(ctx.from.id, ctx.from.first_name)
      const { uuid, link } = await createVlessClient(ctx.from.id, 1)
      const sub = await createTrialSubscription(ctx.from.id, link, uuid)

      await ctx.editMessageText(`🎁 Пробный период активирован!

🔑 Ваш ключ (нажмите, чтобы скопировать):
<code>${escapeHtml(sub.key)}</code>

📅 Действует 24 часа

Скопируйте ключ и вставьте в приложение.`, {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard()
          .text('Подключить устройство', 'connect').row()
          .text('Главное меню', 'goto_menu')
      })
    } else {
      await ctx.editMessageText('главное меню', { reply_markup: menuKeyboard })
    }
  })

  bot.callbackQuery('goto_menu', async (ctx) => {
    await ctx.editMessageText('главное меню', { reply_markup: menuKeyboard })
  })
}
