import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const getDbPath = () => path.join(app.getPath('userData'), 'gemini-db.json');

let data = {
  conversations: [],
  messages: {},
  modelStats: {
    'gemini-1.5-flash-8b': { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, lastUsed: null },
    'gemini-1.5-flash': { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, lastUsed: null },
    'gemini-1.5-pro': { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0, lastUsed: null },
  },
};

async function loadDb() {
  try {
    const content = await fs.readFile(getDbPath(), 'utf-8');
    data = JSON.parse(content);
  } catch {
    // File doesn't exist, use default
  }
}

async function saveDb() {
  await fs.writeFile(getDbPath(), JSON.stringify(data, null, 2));
}

export async function listConversations(limit = 100) {
  await loadDb();
  return data.conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
    .map(c => ({ ...c, messages: [] }));
}

export async function getConversation(id) {
  await loadDb();
  const conv = data.conversations.find(c => c.id === id);
  if (!conv) return null;
  return {
    ...conv,
    messages: data.messages[id] || [],
  };
}

export async function createConversation(title, model) {
  await loadDb();
  const id = uuidv4();
  const now = Date.now();
  const conv = {
    id,
    title,
    model,
    createdAt: now,
    updatedAt: now,
    totalTokens: 0,
    totalCost: 0,
  };
  data.conversations.push(conv);
  data.messages[id] = [];
  await saveDb();
  return id;
}

export async function addMessage(convId, role, content, model, tokens, cost) {
  await loadDb();
  const id = uuidv4();
  const msg = {
    id,
    role,
    content,
    timestamp: Date.now(),
    model,
    tokens,
    cost,
  };
  if (!data.messages[convId]) data.messages[convId] = [];
  data.messages[convId].push(msg);
  
  const conv = data.conversations.find(c => c.id === convId);
  if (conv) {
    conv.updatedAt = Date.now();
    conv.totalTokens += tokens?.total_tokens || 0;
    conv.totalCost += cost || 0;
  }
  
  await saveDb();
  return id;
}

export async function deleteConversation(id) {
  await loadDb();
  data.conversations = data.conversations.filter(c => c.id !== id);
  delete data.messages[id];
  await saveDb();
}

export async function updateConversationTitle(id, title) {
  await loadDb();
  const conv = data.conversations.find(c => c.id === id);
  if (conv) {
    conv.title = title;
    conv.updatedAt = Date.now();
    await saveDb();
  }
}

export async function getModelStats() {
  await loadDb();
  return Object.entries(data.modelStats).map(([model, stats]) => ({
    model,
    ...stats,
  }));
}

export async function updateModelStats(model, inputTokens, outputTokens, cost) {
  await loadDb();
  const stats = data.modelStats[model];
  if (stats) {
    stats.totalRequests++;
    stats.totalInputTokens += inputTokens;
    stats.totalOutputTokens += outputTokens;
    stats.totalCost += cost;
    stats.lastUsed = Date.now();
    await saveDb();
  }
}
