import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import type { Conversation, Message, ModelStats, DailyStats, GeminiModel } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'gemini-app.db');

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!db) {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
    await initDatabase();
  }
  return db;
}

async function initDatabase() {
  if (!db) return;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      total_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      model TEXT,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS model_stats (
      model TEXT PRIMARY KEY,
      total_requests INTEGER DEFAULT 0,
      total_input_tokens INTEGER DEFAULT 0,
      total_output_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0,
      last_used INTEGER
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      total_cost REAL DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      requests_by_model TEXT DEFAULT '{}'
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const defaultSettings = [
    { key: 'defaultModel', value: 'gemini-1.5-flash' },
    { key: 'theme', value: 'dark' },
    { key: 'autoSave', value: 'true' },
    { key: 'maxHistoryItems', value: '100' },
  ];

  for (const setting of defaultSettings) {
    await db.run(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      [setting.key, setting.value]
    );
  }

  const models: GeminiModel[] = ['gemini-1.5-flash-8b', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  for (const model of models) {
    await db.run(
      `INSERT OR IGNORE INTO model_stats (model, total_requests, total_input_tokens, total_output_tokens, total_cost, last_used)
      VALUES (?, 0, 0, 0, 0, NULL)`,
      [model]
    );
  }
}

export async function createConversation(title: string, model: GeminiModel): Promise<string> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = Date.now();
  await db.run(
    `INSERT INTO conversations (id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    [id, title, model, now, now]
  );
  return id;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const db = await getDatabase();
  const conv = await db.get(`SELECT * FROM conversations WHERE id = ?`, [id]);
  if (!conv) return null;

  const messages = await db.all(
    `SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`,
    [id]
  );

  return {
    id: conv.id,
    title: conv.title,
    model: conv.model as GeminiModel,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    totalTokens: conv.total_tokens,
    totalCost: conv.total_cost,
    messages: messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      model: m.model,
      tokens: m.total_tokens > 0 ? {
        input_tokens: m.input_tokens,
        output_tokens: m.output_tokens,
        total_tokens: m.total_tokens,
      } : undefined,
      cost: m.cost,
    })),
  };
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: GeminiModel,
  tokens?: { input_tokens: number; output_tokens: number; total_tokens: number },
  cost?: number
): Promise<string> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = Date.now();

  await db.run(
    `INSERT INTO messages (id, conversation_id, role, content, timestamp, model, input_tokens, output_tokens, total_tokens, cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, conversationId, role, content, now, model || null, 
     tokens?.input_tokens || 0, tokens?.output_tokens || 0, tokens?.total_tokens || 0, 
     cost || 0]
  );

  await db.run(
    `UPDATE conversations SET updated_at = ?, total_tokens = total_tokens + ?, total_cost = total_cost + ?
    WHERE id = ?`,
    [now, tokens?.total_tokens || 0, cost || 0, conversationId]
  );

  return id;
}

export async function listConversations(limit = 100): Promise<Conversation[]> {
  const db = await getDatabase();
  const convs = await db.all(`SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ?`, [limit]);
  
  return convs.map(conv => ({
    id: conv.id,
    title: conv.title,
    model: conv.model as GeminiModel,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    totalTokens: conv.total_tokens,
    totalCost: conv.total_cost,
    messages: [],
  }));
}

export async function updateConversationTitle(id: string, title: string) {
  const db = await getDatabase();
  await db.run(`UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?`,
    [title, Date.now(), id]);
}

export async function deleteConversation(id: string) {
  const db = await getDatabase();
  await db.run(`DELETE FROM conversations WHERE id = ?`, [id]);
}

export async function updateModelStats(
  model: GeminiModel,
  inputTokens: number,
  outputTokens: number,
  cost: number
) {
  const db = await getDatabase();
  
  await db.run(
    `UPDATE model_stats SET total_requests = total_requests + 1,
        total_input_tokens = total_input_tokens + ?,
        total_output_tokens = total_output_tokens + ?,
        total_cost = total_cost + ?,
        last_used = ?
    WHERE model = ?`,
    [inputTokens, outputTokens, cost, Date.now(), model]
  );

  const today = new Date().toISOString().split('T')[0];
  const dailyRow = await db.get(`SELECT * FROM daily_stats WHERE date = ?`, [today]);
  
  if (dailyRow) {
    const requestsByModel = JSON.parse(dailyRow.requests_by_model || '{}');
    requestsByModel[model] = (requestsByModel[model] || 0) + 1;
    await db.run(
      `UPDATE daily_stats SET total_cost = total_cost + ?, total_tokens = total_tokens + ?, requests_by_model = ?
      WHERE date = ?`,
      [cost, inputTokens + outputTokens, JSON.stringify(requestsByModel), today]
    );
  } else {
    const requestsByModel = { [model]: 1 };
    await db.run(
      `INSERT INTO daily_stats (date, total_cost, total_tokens, requests_by_model) VALUES (?, ?, ?, ?)`,
      [today, cost, inputTokens + outputTokens, JSON.stringify(requestsByModel)]
    );
  }
}

export async function getModelStats(): Promise<ModelStats[]> {
  const db = await getDatabase();
  const stats = await db.all(`SELECT * FROM model_stats ORDER BY total_cost DESC`);

  return stats.map(s => ({
    model: s.model as GeminiModel,
    totalRequests: s.total_requests,
    totalInputTokens: s.total_input_tokens,
    totalOutputTokens: s.total_output_tokens,
    totalCost: s.total_cost,
    lastUsed: s.last_used,
  }));
}

export async function getDailyStats(days = 30): Promise<DailyStats[]> {
  const db = await getDatabase();
  const stats = await db.all(
    `SELECT * FROM daily_stats WHERE date >= date('now', '-${days} days') ORDER BY date DESC`
  );

  return stats.map(s => ({
    date: s.date,
    totalCost: s.total_cost,
    totalTokens: s.total_tokens,
    requestsByModel: JSON.parse(s.requests_by_model),
  }));
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const result = await db.get(`SELECT value FROM settings WHERE key = ?`, [key]);
  return result?.value || null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDatabase();
  await db.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
