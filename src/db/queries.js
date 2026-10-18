import { pool } from './index.js'

// Получить юзера по telegram ID
export async function getUser(telegramId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [telegramId]
  )
  return result.rows[0] || null
}

// Создать юзера
export async function createUser(telegramId, firstName) {
  const result = await pool.query(
    'INSERT INTO users (id, first_name) VALUES ($1, $2) RETURNING *',
    [telegramId, firstName]
  )
  return result.rows[0]
}

// Получить активную подписку юзера
export async function getSubscription(telegramId) {
  const result = await pool.query(
    'SELECT * FROM subscriptions WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [telegramId]
  )
  return result.rows[0] || null
}

// Создать пробную подписку
export async function createTrialSubscription(telegramId) {
  const result = await pool.query(
    'INSERT INTO subscriptions (user_id, key, expires_at, is_trial) VALUES ($1, $2, NOW() + INTERVAL \'1 day\', true) RETURNING *',
    [telegramId, 'vless://demo-key-' + telegramId]
  )
  return result.rows[0]
}

export async function createSubscription(telegramId, days) {
  const result = await pool.query(
    'INSERT INTO subscriptions (user_id, key, expires_at, is_trial) VALUES ($1, $2, NOW() + ($3 || \' days\')::INTERVAL, false) RETURNING *',
    [telegramId, 'vless://demo-key-' + telegramId, days]
  )
  return result.rows[0]
}