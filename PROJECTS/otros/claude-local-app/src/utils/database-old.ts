import Database from 'better-sqlite3';
import type { Conversation, Message, ModelStats, DailyStats, GeminiModel } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'gemini-app.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDatabase();
  }
  return db;
}

function initDatabase() {
  if (!db) return;

  // Conversations table
  db.exec(`
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

  // Messages table
  db.exec(`
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

  // Stats table - tracks usage by model
  db.exec(`
    CREATE TABLE IF NOT EXISTS model_stats (
      model TEXT PRIMARY KEY,
      total_requests INTEGER DEFAULT 0,
      total_input_tokens INTEGER DEFAULT 0,
      total_output_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0,
      last_used INTEGER
    )
  `);

  // Daily stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      date TEXT PRIMARY KEY,
      total_cost REAL DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      requests_by_model TEXT DEFAULT '{}' -- JSON object
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Insert default settings if not exists
  const defaultSettings = [
    { key: 'defaultModel', value: 'gemini-1.5-flash' },
    { key: 'theme', value: 'dark' },
    { key: 'autoSave', value: 'true' },
    { key: 'maxHistoryItems', value: '100' },
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value);
  }

  // Initialize model stats
  const models: GeminiModel[] = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  const initModelStats = db.prepare(`
    INSERT OR IGNORE INTO model_stats 
    (model, total_requests, total_input_tokens, total_output_tokens, total_cost, last_used)
    VALUES (?, 0, 0, 0, 0, NULL)
  `);

  for (const model of models) {
    initModelStats.run(model);
  }
}

// Conversation operations
export function createConversation(title: string, model: GeminiModel): string {
  const db = getDatabase();
  const id = uuidv4();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO conversations (id, title, model, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, title, model, now, now);
  return id;
}

export function getConversation(id: string): Conversation | null {
  const db = getDatabase();
  
  const convStmt = db.prepare(`
    SELECT * FROM conversations WHERE id = ?
  `);
  const conv = convStmt.get(id) as any;
  
  if (!conv) return null;

  const msgStmt = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC
  `);
  const messages = msgStmt.all(id) as any[];

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
      cost: m.cost > 0 ? m.cost : undefined,
    })),
  };
}

export function getConversations(limit = 100): Conversation[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ?
  `);
  
  const convs = stmt.all(limit) as any[];
  
  return convs.map(conv => ({
    id: conv.id,
    title: conv.title,
    model: conv.model as GeminiModel,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    totalTokens: conv.total_tokens,
    totalCost: conv.total_cost,
    messages: [], // Don't load all messages for list
  }));
}

export function updateConversationTitle(id: string, title: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?
  `);
  stmt.run(title, Date.now(), id);
}

export function deleteConversation(id: string) {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM conversations WHERE id = ?`);
  stmt.run(id);
}

// Message operations
export function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: ClaudeModel,
  tokens?: { input_tokens: number; output_tokens: number; total_tokens: number },
  cost?: number
): string {
  const db = getDatabase();
  const id = uuidv4();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO messages 
    (id, conversation_id, role, content, timestamp, model, input_tokens, output_tokens, total_tokens, cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    conversationId,
    role,
    content,
    now,
    model || null,
    tokens?.input_tokens || 0,
    tokens?.output_tokens || 0,
    tokens?.total_tokens || 0,
    cost || 0
  );

  // Update conversation stats
  const updateConv = db.prepare(`
    UPDATE conversations 
    SET updated_at = ?, total_tokens = total_tokens + ?, total_cost = total_cost + ?
    WHERE id = ?
  `);
  updateConv.run(now, tokens?.total_tokens || 0, cost || 0, conversationId);

  return id;
}

// Stats operations
export function updateModelStats(
  model: ClaudeModel,
  inputTokens: number,
  outputTokens: number,
  cost: number
) {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    UPDATE model_stats 
    SET total_requests = total_requests + 1,
        total_input_tokens = total_input_tokens + ?,
        total_output_tokens = total_output_tokens + ?,
        total_cost = total_cost + ?,
        last_used = ?
    WHERE model = ?
  `);

  stmt.run(inputTokens, outputTokens, cost, Date.now(), model);

  // Update daily stats
  const today = new Date().toISOString().split('T')[0];
  const dailyStmt = db.prepare(`
    INSERT INTO daily_stats (date, total_cost, total_tokens, requests_by_model)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_cost = total_cost + excluded.total_cost,
      total_tokens = total_tokens + excluded.total_tokens,
      requests_by_model = ?
  `);

  // Get existing requests_by_model and update
  const existing = db.prepare('SELECT requests_by_model FROM daily_stats WHERE date = ?').get(today) as any;
  const requestsByModel = existing ? JSON.parse(existing.requests_by_model) : {};
  requestsByModel[model] = (requestsByModel[model] || 0) + 1;

  dailyStmt.run(today, cost, inputTokens + outputTokens, JSON.stringify(requestsByModel), JSON.stringify(requestsByModel));
}

export function getModelStats(): ModelStats[] {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT * FROM model_stats ORDER BY total_cost DESC`);
  const stats = stmt.all() as any[];

  return stats.map(s => ({
    model: s.model as GeminiModel,
    totalRequests: s.total_requests,
    totalInputTokens: s.total_input_tokens,
    totalOutputTokens: s.total_output_tokens,
    totalCost: s.total_cost,
    lastUsed: s.last_used,
  }));
}

export function getDailyStats(days = 30): DailyStats[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM daily_stats 
    WHERE date >= date('now', '-${days} days')
    ORDER BY date DESC
  `);
  const stats = stmt.all() as any[];

  return stats.map(s => ({
    date: s.date,
    totalCost: s.total_cost,
    totalTokens: s.total_tokens,
    requestsByModel: JSON.parse(s.requests_by_model),
  }));
}

// Settings operations
export function getSetting(key: string): string | null {
  const db = getDatabase();
  const stmt = db.prepare(`SELECT value FROM settings WHERE key = ?`);
  const result = stmt.get(key) as any;
  return result?.value || null;
}

export function setSetting(key: string, value: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
