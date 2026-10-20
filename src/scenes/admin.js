import { ADMIN_IDS } from '../config.js'
import { getAllUsersWithSubscriptions } from '../db/queries.js'

export function adminScene(bot) {
  bot.command('admin', async (ctx) => {
    if (!ADMIN_IDS.includes(ctx.from.id)) return // не админ — молча игнорим

    const rows = await getAllUsersWithSubscriptions()

    if (rows.length === 0) {
      return ctx.reply('Пользователей пока нет.')
    }

    const lines = rows.map(r => {
      const status = r.expires_at
        ? (new Date(r.expires_at) > new Date()
            ? `активна до ${new Date(r.expires_at).toLocaleString('ru-RU')}`
            : 'истекла')
        : 'нет подписки'
      const trial = r.is_trial ? ' (пробная)' : ''
      return `🆔 ${r.id} — ${r.first_name || 'без имени'}\n   ${status}${trial}`
    })

    // Telegram режет сообщение на 4096 символов — бьём список на части
    const chunkSize = 30
    for (let i = 0; i < lines.length; i += chunkSize) {
      await ctx.reply(lines.slice(i, i + chunkSize).join('\n\n'))
    }
  })
}
