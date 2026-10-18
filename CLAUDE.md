# VPN Bot Project

## Описание
Telegram-бот для VPN-сервиса на Node.js + Grammy + PostgreSQL (Supabase).

## Стек
- Node.js (ES modules, "type": "module")
- Grammy — Telegram bot framework
- PostgreSQL через Supabase
- dotenv для конфигурации

## Структура
- src/bot.js — точка входа
- src/config.js — токен из .env
- src/scenes/ — сцены бота (start, menu, subscription, payment, support, connect)
- src/db/index.js — подключение к БД
- src/db/queries.js — SQL запросы

## Запуск
node src/bot.js

## Переменные окружения (.env)
BOT_TOKEN=токен от BotFather
DATABASE_URL=строка подключения к Supabase

## Архитектура бота
Каждая сцена — функция которая принимает bot и регистрирует обработчики.
Inline кнопки для навигации, editMessageText для переходов между экранами.

## База данных
Таблицы: users, subscriptions