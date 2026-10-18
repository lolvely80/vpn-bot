import { InlineKeyboard } from "grammy";


export function startScene(bot) {
    const keyboard = new InlineKeyboard()
  .text('Начать', 'main_menu')

bot.command('start', (ctx)=>{
    ctx.reply(`
Что умеет этот бот?

 Высокая скорость
 Низкие цены
 Без ограничений по трафику
 Настройка в несколько кликов
 Вознаграждение за приглашённых друзей
 Оперативная онлайн поддержка

Жми «Начать» и получи подарок — сутки бесплатно
        ` , {
        reply_markup: keyboard
    });
})}