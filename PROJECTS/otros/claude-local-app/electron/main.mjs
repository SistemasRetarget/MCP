import { app, BrowserWindow, shell, Menu, dialog, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let astroProcess;
let expressServer;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const SERVER_PORT = 34567; // Fixed port for production

// Start Express server for API routes
async function startServer() {
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(bodyParser.json());
  
  // Import database functions dynamically
  const { 
    listConversations, 
    getConversation, 
    createConversation,
    addMessage,
    deleteConversation,
    updateConversationTitle,
    getModelStats,
    updateModelStats
  } = await import('../dist/server/database.js');
  
  const { sendMessage, generateConversationTitle } = await import('../dist/server/gemini.js');
  
  // API Routes
  expressApp.get('/api/conversations', async (req, res) => {
    try {
      const id = req.query.id;
      if (id) {
        const conversation = await getConversation(id);
        if (!conversation) return res.status(404).json({ error: 'Not found' });
        return res.json(conversation);
      }
      const limit = parseInt(req.query.limit || '100');
      const conversations = await listConversations(limit);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.delete('/api/conversations', async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.patch('/api/conversations', async (req, res) => {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { title } = req.body;
      if (title) await updateConversationTitle(id, title);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.post('/api/chat', async (req, res) => {
    try {
      const { message, model, conversationId, systemPrompt, temperature, maxTokens } = req.body;
      
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(message.slice(0, 50) || 'Nueva conversación', model);
      }
      
      await addMessage(convId, 'user', message, model);
      
      const response = await sendMessage(message, model, [], systemPrompt, temperature, maxTokens);
      
      const assistantMessage = await addMessage(convId, 'assistant', response.content, model, response.tokens, response.cost);
      
      await updateModelStats(model, response.tokens?.input_tokens || 0, response.tokens?.output_tokens || 0, response.cost || 0);
      
      res.json({
        message: {
          id: assistantMessage,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          model,
          tokens: response.tokens,
          cost: response.cost,
        },
        conversationId: convId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/stats', async (req, res) => {
    try {
      const stats = await getModelStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  expressApp.get('/api/templates', (req, res) => {
    res.json({ templates: [] }); // Templates are loaded client-side
  });
  
  // Serve static files
  expressApp.use(express.static(path.join(__dirname, '../dist/client')));
  
  // SPA fallback
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  });
  
  return new Promise((resolve) => {
    expressServer = expressApp.listen(SERVER_PORT, () => {
      console.log(`Server running on port ${SERVER_PORT}`);
      resolve(SERVER_PORT);
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
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
    {
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'System',
      submenu: [
        {
          label: 'Open Terminal',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            spawn('open', ['-a', 'Terminal'], { detached: true });
          }
        },
        {
          label: 'Open Finder',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => {
            spawn('open', [process.cwd()], { detached: true });
          }
        },
        { type: 'separator' },
        {
          label: 'System Info',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              console.log('Platform:', process.platform);
              console.log('Arch:', process.arch);
              console.log('Node version:', process.versions.node);
            `);
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  // Start Express server for production
  if (!isDev) {
    await startServer();
  }
  
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (astroProcess) {
    astroProcess.kill();
  }
  if (expressServer) {
    expressServer.close();
  }
});

app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
