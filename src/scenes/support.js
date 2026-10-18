import { InlineKeyboard } from "grammy";


export function supportScene(bot) {
    bot.callbackQuery('support', (ctx)=>{
        ctx.editMessageText('По всем вопросам обращайтесь к нашей поддержке - @Glebasyandra', {
            reply_markup: new InlineKeyboard()
                .text('Назад', 'main_menu')
                
        })      
    }
)}