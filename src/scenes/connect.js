import { InlineKeyboard } from 'grammy'

export function connectScene(bot) {
  bot.callbackQuery('connect', (ctx) => {
    ctx.editMessageText('Выберите вашу платформу:', {
      reply_markup: new InlineKeyboard()
        .text('iOS', 'platform_ios').row()
        .text('Android', 'platform_android').row()
        .text('Windows', 'platform_windows').row()
        .text('macOS', 'platform_macos').row()
        .text('Назад', 'main_menu')
    })
  })

  bot.callbackQuery('platform_ios', (ctx) => {
    ctx.editMessageText(`📱 Инструкция для iPhone:

1. Откройте App Store
2. Найдите HAPP или INCY и установите
3. Скопируйте ключ который мы вам выдали
4. Запустите приложение и нажмите +
5. Вставьте ключ и сохраните
6. Нажмите «Подключиться»
7. Подтвердите запрос если появится

HAPP: https://apps.apple.com/app/happ-proxy-utility/id6504287215
INCY: https://apps.apple.com/app/incy/id6478247686`, {
      reply_markup: new InlineKeyboard().text('Назад', 'connect')
    })
  })

  bot.callbackQuery('platform_android', (ctx) => {
    ctx.editMessageText(`🤖 Инструкция для Android:

1. Установите HAPP или INCY из Google Play
2. Откройте приложение
3. Скопируйте ключ из нашего сообщения
4. Нажмите + или кнопку добавления подключения
5. Вставьте ключ и подтвердите импорт
6. Нажмите «Подключиться» и разрешите создание VPN

HAPP: https://play.google.com/store/apps/details?id=com.happ.proxy
INCY: https://play.google.com/store/apps/details?id=com.incy.vpn`, {
      reply_markup: new InlineKeyboard().text('Назад', 'connect')
    })
  })

  bot.callbackQuery('platform_windows', (ctx) => {
    ctx.editMessageText(`💻 Инструкция для Windows:

1. Скачайте HAPP или INCY для Windows
2. Запустите установочный файл
3. Скопируйте выданный нами ключ
4. Откройте приложение и нажмите +
5. Вставьте ключ и сохраните
6. Нажмите кнопку подключения

HAPP: https://github.com/hiddify/hiddify-app/releases
INCY: https://incy.io/download`, {
      reply_markup: new InlineKeyboard().text('Назад', 'connect')
    })
  })

  bot.callbackQuery('platform_macos', (ctx) => {
    ctx.editMessageText(`🍎 Инструкция для macOS:

1. Скачайте HAPP или INCY для Mac
2. Установите приложение и откройте его
3. Скопируйте полученный от нас ключ
4. Нажмите + и добавьте конфигурацию
5. Сохраните подключение
6. Нажмите «Подключиться» и подтвердите запрос

HAPP: https://github.com/hiddify/hiddify-app/releases
INCY: https://incy.io/download`, {
      reply_markup: new InlineKeyboard().text('Назад', 'connect')
    })
  })
}