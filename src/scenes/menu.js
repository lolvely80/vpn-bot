import { InlineKeyboard } from "grammy";
import { getUser, createUser, createTrialSubscription } from '../db/queries.js'


export function menuScene(bot) {
const menuKeyboard = new InlineKeyboard()
    .text('Подключить устройство', 'connect').row()
    .text('Моя подписка', 'subscription').row()
    .text('Продлить подписку', 'extend').row()
    .text('Поддержка', 'support')

    bot.callbackQuery('main_menu', async (ctx) => {
  const user = await getUser(ctx.from.id)
  
  if (!user) {
    // новый юзер — создаём и даём пробный период
    await createUser(ctx.from.id, ctx.from.first_name)
    const sub = await createTrialSubscription(ctx.from.id)
    
    await ctx.editMessageText(`🎁 Пробный период активирован!

🔑 Ваш ключ:
${sub.key}

📅 Действует 24 часа

Скопируйте ключ и вставьте в приложение.`, {
      reply_markup: new InlineKeyboard()
        .text('Подключить устройство', 'connect').row()
        .text('Главное меню', 'goto_menu')
    })
  } else {
    // старый юзер — показываем меню
    await ctx.editMessageText('главное меню', { reply_markup: menuKeyboard })
  }
})
bot.callbackQuery('goto_menu', async (ctx) => {
  await ctx.editMessageText('главное меню', { reply_markup: menuKeyboard })
})

}
