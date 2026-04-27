import { contextBridge, ipcRenderer } from 'electron';

// Expose database operations to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  listConversations: () => ipcRenderer.invoke('db:listConversations'),
  getConversation: (id) => ipcRenderer.invoke('db:getConversation', id),
  createConversation: (title, model) => ipcRenderer.invoke('db:createConversation', title, model),
  addMessage: (convId, role, content, model, tokens, cost) => 
    ipcRenderer.invoke('db:addMessage', convId, role, content, model, tokens, cost),
  deleteConversation: (id) => ipcRenderer.invoke('db:deleteConversation', id),
  updateTitle: (id, title) => ipcRenderer.invoke('db:updateTitle', id, title),
  getModelStats: () => ipcRenderer.invoke('db:getModelStats'),
  updateModelStats: (model, inputTokens, outputTokens, cost) => 
    ipcRenderer.invoke('db:updateModelStats', model, inputTokens, outputTokens, cost),
  
  // Gemini API
  sendMessage: (message, model, apiKey) => ipcRenderer.invoke('gemini:sendMessage', message, model, apiKey),
  
  // System info
  platform: process.platform,
  arch: process.arch,
});
