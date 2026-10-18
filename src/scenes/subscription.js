import { InlineKeyboard } from 'grammy'
import { getSubscription, getUser} from '../db/queries.js'

export function subscriptionScene(bot) {
        bot.callbackQuery('subscription',async (ctx)=>{
        const user = await getUser(ctx.from.id)
        const sub = await getSubscription(ctx.from.id)
        ctx.editMessageText(`👤 Профиль:
📝 Имя: ${ctx.from.first_name}
🆔 ${ctx.from.id}
💳 Баланс: 0 ₽

🔑 Ваша подписка:
${sub.key}

📅 Срок действия: ${new Date(sub.expires_at).toLocaleDateString('ru-RU')})

💡 Используйте кнопки ниже для управления подпиской`, {
            reply_markup: new InlineKeyboard()
            .text('Продлить подписку', 'extend').row()    
            .text('Назад', 'main_menu').row()
                
        })
    })}