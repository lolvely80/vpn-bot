import 'dotenv/config'
import { BOT_TOKEN } from './config.js'
import { Bot } from "grammy";
import { startScene } from './scenes/start.js'
import { menuScene } from './scenes/menu.js'
import { supportScene } from './scenes/support.js'
import { subscriptionScene } from './scenes/subscription.js'
import { paymentScene } from './scenes/payment.js'
import { connectScene } from './scenes/connect.js'

const bot = new Bot(BOT_TOKEN);


startScene(bot);
menuScene(bot);
supportScene(bot);
subscriptionScene(bot);
paymentScene(bot);
connectScene(bot);

bot.start();