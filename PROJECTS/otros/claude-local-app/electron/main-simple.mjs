import { app, BrowserWindow, shell, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db-json.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// IPC handlers for database
ipcMain.handle('db:listConversations', () => db.listConversations());
ipcMain.handle('db:getConversation', (_, id) => db.getConversation(id));
ipcMain.handle('db:createConversation', (_, title, model) => db.createConversation(title, model));
ipcMain.handle('db:addMessage', (_, convId, role, content, model, tokens, cost) => 
  db.addMessage(convId, role, content, model, tokens, cost));
ipcMain.handle('db:deleteConversation', (_, id) => db.deleteConversation(id));
ipcMain.handle('db:updateTitle', (_, id, title) => db.updateConversationTitle(id, title));
ipcMain.handle('db:getModelStats', () => db.getModelStats());
ipcMain.handle('db:updateModelStats', (_, model, inputTokens, outputTokens, cost) => 
  db.updateModelStats(model, inputTokens, outputTokens, cost));

// Gemini API handler
ipcMain.handle('gemini:sendMessage', async (_, message, model, apiKey) => {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model });
  
  const result = await genModel.generateContent(message);
  const response = await result.response;
  const text = response.text();
  
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
});

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

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
      preload: path.join(__dirname, 'preload-simple.mjs'),
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

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
