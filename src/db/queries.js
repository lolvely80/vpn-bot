import { pool } from './index.js'

export async function getUser(telegramId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [telegramId]
  )
  return result.rows[0] || null
}

export async function createUser(telegramId, firstName) {
  const result = await pool.query(
    'INSERT INTO users (id, first_name) VALUES ($1, $2) RETURNING *',
    [telegramId, firstName]
  )
  return result.rows[0]
}

export async function getSubscription(telegramId) {
  const result = await pool.query(
    'SELECT * FROM subscriptions WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [telegramId]
  )
  return result.rows[0] || null
}

export async function createTrialSubscription(telegramId, key, xuiUuid) {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, key, xui_uuid, expires_at, is_trial)
     VALUES ($1, $2, $3, NOW() + INTERVAL '1 day', true) RETURNING *`,
    [telegramId, key, xuiUuid]
  )
  return result.rows[0]
}

export async function createSubscription(telegramId, key, xuiUuid, days) {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, key, xui_uuid, expires_at, is_trial)
     VALUES ($1, $2, $3, NOW() + ($4 || ' days')::INTERVAL, false) RETURNING *`,
    [telegramId, key, xuiUuid, days]
  )
  return result.rows[0]
}

export async function getAllUsersWithSubscriptions() {
  const result = await pool.query(`
    SELECT u.id, u.first_name, s.expires_at, s.is_trial
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
      AND s.id = (
        SELECT id FROM subscriptions
        WHERE user_id = u.id
        ORDER BY created_at DESC LIMIT 1
      )
    ORDER BY u.id
  `)
  return result.rows
}
