// Gemini Models
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-flash-8b' | 'gemini-1.5-pro';

export interface ModelConfig {
  id: GeminiModel;
  name: string;
  description: string;
  costPer1MInput: number;
  costPer1MOutput: number;
  color: string;
  speed: 'ultra-fast' | 'fast' | 'deep';
  useCases: string[];
  maxTokens: number;
}

// Gemini Pro pricing (aproximado, verifica en console.cloud.google.com)
export const MODELS: Record<GeminiModel, ModelConfig> = {
  'gemini-1.5-flash-8b': {
    id: 'gemini-1.5-flash-8b',
    name: 'Flash 8B',
    description: 'Ultra-rápido, modelo ligero para tareas simples',
    costPer1MInput: 0.0375,
    costPer1MOutput: 0.15,
    color: '#22c55e',
    speed: 'ultra-fast',
    useCases: ['Refactoring', 'Documentación', 'Revisión rápida', 'Respuestas simples'],
    maxTokens: 8192,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Flash',
    description: 'Rápido y eficiente para la mayoría de tareas',
    costPer1MInput: 0.075,
    costPer1MOutput: 0.30,
    color: '#3b82f6',
    speed: 'fast',
    useCases: ['Generación código', 'Debugging', 'Arquitectura general', 'Chat'],
    maxTokens: 8192,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Pro',
    description: 'Máxima calidad para decisiones críticas',
    costPer1MInput: 1.25,
    costPer1MOutput: 5.00,
    color: '#8b5cf6',
    speed: 'deep',
    useCases: ['Decisiones arquitectónicas', 'Diseño sistemas complejos', 'Análisis profundo', 'Razonamiento avanzado'],
    maxTokens: 8192,
  },
};

// Messages and Conversations
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: GeminiModel;
  tokens?: TokenUsage;
  cost?: number;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: GeminiModel;
  createdAt: number;
  updatedAt: number;
  totalTokens: number;
  totalCost: number;
}

// Templates
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
  defaultModel: GeminiModel;
  variables: string[];
}

export type TemplateCategory = 
  | 'architecture'
  | 'code'
  | 'review'
  | 'documentation'
  | 'debugging'
  | 'custom';

// Stats
export interface ModelStats {
  model: GeminiModel;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  lastUsed: number;
}

export interface DailyStats {
  date: string;
  totalCost: number;
  totalTokens: number;
  requestsByModel: Record<GeminiModel, number>;
}

// Editor
export interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isActive: boolean;
}

// API
export interface ChatRequest {
  message: string;
  model: GeminiModel;
  conversationId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
}

// API Key Management per Model
export interface ModelApiKey {
  model: GeminiModel;
  apiKey: string;
  isActive: boolean;
  lastTested: number | null;
  errorMessage?: string;
}

// Credits and Monetization
export interface CreditBalance {
  totalSpent: number;
  currentSessionSpend: number;
  dailyLimit: number;
  monthlyLimit: number;
  alertsEnabled: boolean;
  alertThreshold: number; // percentage (e.g., 80)
}

export interface SpendingAlert {
  type: 'daily' | 'monthly' | 'threshold';
  message: string;
  currentSpend: number;
  limit: number;
  triggeredAt: number;
}

// System Command Execution
export interface SystemCommandRequest {
  command: string;
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface SystemCommandResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  executedAt: number;
  duration: number;
}

// Settings
export interface AppSettings {
  defaultModel: GeminiModel;
  theme: 'light' | 'dark' | 'system';
  apiKeys: Record<GeminiModel, string>; // model -> apiKey mapping
  autoSave: boolean;
  maxHistoryItems: number;
  systemAccessEnabled: boolean; // Allow AI to execute system commands
  commandWhitelist: string[]; // Allowed commands (e.g., ['ls', 'cd', 'pwd'])
  credits: CreditBalance;
}
