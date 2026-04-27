import { app, BrowserWindow, shell, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Initialize database
async function initDatabase() {
  const DB_PATH = path.join(app.getPath('userData'), 'gemini-app.db');
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      total_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0
    );
    
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
      cost REAL DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS model_stats (
      model TEXT PRIMARY KEY,
      total_requests INTEGER DEFAULT 0,
      total_input_tokens INTEGER DEFAULT 0,
      total_output_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0,
      last_used INTEGER
    );
  `);
}

// IPC Handlers
ipcMain.handle('db:listConversations', async () => {
  const convs = await db.all(`SELECT * FROM conversations ORDER BY updated_at DESC`);
  return convs.map(c => ({
    id: c.id,
    title: c.title,
    model: c.model,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    totalTokens: c.total_tokens,
    totalCost: c.total_cost,
    messages: [],
  }));
});

ipcMain.handle('db:getConversation', async (_, id) => {
  const c = await db.get(`SELECT * FROM conversations WHERE id = ?`, [id]);
  if (!c) return null;
  
  const messages = await db.all(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp`, [id]);
  
  return {
    id: c.id,
    title: c.title,
    model: c.model,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    totalTokens: c.total_tokens,
    totalCost: c.total_cost,
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
});

ipcMain.handle('db:createConversation', async (_, title, model) => {
  const id = uuidv4();
  const now = Date.now();
  await db.run(`INSERT INTO conversations (id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
    [id, title, model, now, now]);
  return id;
});

ipcMain.handle('db:addMessage', async (_, convId, role, content, model, tokens, cost) => {
  const id = uuidv4();
  const now = Date.now();
  await db.run(`INSERT INTO messages (id, conversation_id, role, content, timestamp, model, input_tokens, output_tokens, total_tokens, cost) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, convId, role, content, now, model, tokens?.input_tokens || 0, tokens?.output_tokens || 0, tokens?.total_tokens || 0, cost || 0]);
  
  if (role === 'assistant') {
    await db.run(`UPDATE conversations SET updated_at = ?, total_tokens = total_tokens + ?, total_cost = total_cost + ? WHERE id = ?`,
      [now, tokens?.total_tokens || 0, cost || 0, convId]);
  }
  return id;
});

ipcMain.handle('db:deleteConversation', async (_, id) => {
  await db.run(`DELETE FROM messages WHERE conversation_id = ?`, [id]);
  await db.run(`DELETE FROM conversations WHERE id = ?`, [id]);
});

ipcMain.handle('db:updateTitle', async (_, id, title) => {
  await db.run(`UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?`,
    [title, Date.now(), id]);
});

ipcMain.handle('db:getModelStats', async () => {
  const stats = await db.all(`SELECT * FROM model_stats ORDER BY total_cost DESC`);
  return stats.map(s => ({
    model: s.model,
    totalRequests: s.total_requests,
    totalInputTokens: s.total_input_tokens,
    totalOutputTokens: s.total_output_tokens,
    totalCost: s.total_cost,
    lastUsed: s.last_used,
  }));
});

ipcMain.handle('db:updateModelStats', async (_, model, inputTokens, outputTokens, cost) => {
  await db.run(`INSERT OR REPLACE INTO model_stats (model, total_requests, total_input_tokens, total_output_tokens, total_cost, last_used)
    VALUES (?, COALESCE((SELECT total_requests FROM model_stats WHERE model = ?), 0) + 1,
      COALESCE((SELECT total_input_tokens FROM model_stats WHERE model = ?), 0) + ?,
      COALESCE((SELECT total_output_tokens FROM model_stats WHERE model = ?), 0) + ?,
      COALESCE((SELECT total_cost FROM model_stats WHERE model = ?), 0) + ?, ?)`,
    [model, model, model, inputTokens, model, outputTokens, model, cost, Date.now()]);
});

// Gemini API call
ipcMain.handle('gemini:sendMessage', async (_, message, model, apiKey) => {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    const result = await genModel.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    // Estimate tokens (rough approximation)
    const inputTokens = Math.ceil(message.length / 4);
    const outputTokens = Math.ceil(text.length / 4);
    
    return {
      content: text,
      tokens: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    { label: app.getName(), submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] },
    { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }] },
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
