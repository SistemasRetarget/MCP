import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Conversation, 
  Message, 
  GeminiModel, 
  ModelStats,
  PromptTemplate,
  ModelApiKey,
  CreditBalance,
  SpendingAlert,
  SystemCommandResponse
} from '@/types';
import { MODELS } from '@/types';

interface AppState {
  // Current conversation
  currentConversation: Conversation | null;
  conversations: Conversation[];
  
  // Model selection
  selectedModel: GeminiModel;
  
  // API Keys per model
  apiKeys: Record<GeminiModel, string>;
  modelStatus: Record<GeminiModel, ModelApiKey>;
  
  // Credits and Monetization
  credits: CreditBalance;
  alerts: SpendingAlert[];
  
  // System Access
  systemAccessEnabled: boolean;
  commandWhitelist: string[];
  recentCommands: SystemCommandResponse[];
  
  // UI State
  isSidebarOpen: boolean;
  isTemplateModalOpen: boolean;
  isStatsModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isCreditsModalOpen: boolean;
  activeTemplate: PromptTemplate | null;
  
  // Loading states
  isLoading: boolean;
  isStreaming: boolean;
  
  // Stats
  modelStats: ModelStats[];
  
  // Settings
  theme: 'light' | 'dark' | 'system';
  
  // Actions - Conversations
  setCurrentConversation: (conversation: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  
  // Actions - Models
  selectModel: (model: GeminiModel) => void;
  setApiKeyForModel: (model: GeminiModel, apiKey: string) => void;
  removeApiKeyForModel: (model: GeminiModel) => void;
  updateModelStatus: (model: GeminiModel, status: Partial<ModelApiKey>) => void;
  isModelAvailable: (model: GeminiModel) => boolean;
  getAvailableModels: () => GeminiModel[];
  
  // Actions - Messages
  addMessageToCurrent: (message: Message) => void;
  updateLastMessage: (content: string, tokens?: any, cost?: number) => void;
  
  // Actions - Credits
  addSpend: (amount: number) => void;
  resetSessionSpend: () => void;
  setDailyLimit: (limit: number) => void;
  setMonthlyLimit: (limit: number) => void;
  addAlert: (alert: SpendingAlert) => void;
  clearAlerts: () => void;
  getSpendPercentage: () => number;
  
  // Actions - System
  setSystemAccessEnabled: (enabled: boolean) => void;
  addCommandToWhitelist: (command: string) => void;
  removeCommandFromWhitelist: (command: string) => void;
  addRecentCommand: (response: SystemCommandResponse) => void;
  clearRecentCommands: () => void;
  
  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setCreditsModalOpen: (open: boolean) => void;
  setActiveTemplate: (template: PromptTemplate | null) => void;
  
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  
  setModelStats: (stats: ModelStats[]) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Computed
  getEstimatedCost: (inputTokens: number, outputTokens: number) => number;
  getTotalSpend: () => number;
}

const initialApiKeys: Record<GeminiModel, string> = {
  'gemini-1.5-flash-8b': '',
  'gemini-1.5-flash': '',
  'gemini-1.5-pro': '',
};

const initialModelStatus = (apiKeys: Record<GeminiModel, string>): Record<GeminiModel, ModelApiKey> => ({
  'gemini-1.5-flash-8b': {
    model: 'gemini-1.5-flash-8b',
    apiKey: apiKeys['gemini-1.5-flash-8b'],
    isActive: apiKeys['gemini-1.5-flash-8b'].length > 0,
    lastTested: null,
  },
  'gemini-1.5-flash': {
    model: 'gemini-1.5-flash',
    apiKey: apiKeys['gemini-1.5-flash'],
    isActive: apiKeys['gemini-1.5-flash'].length > 0,
    lastTested: null,
  },
  'gemini-1.5-pro': {
    model: 'gemini-1.5-pro',
    apiKey: apiKeys['gemini-1.5-pro'],
    isActive: apiKeys['gemini-1.5-pro'].length > 0,
    lastTested: null,
  },
});

const initialCredits: CreditBalance = {
  totalSpent: 0,
  currentSessionSpend: 0,
  dailyLimit: 10,
  monthlyLimit: 100,
  alertsEnabled: true,
  alertThreshold: 80,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversation: null,
      conversations: [],
      selectedModel: 'gemini-1.5-flash',
      apiKeys: initialApiKeys,
      modelStatus: initialModelStatus(initialApiKeys),
      credits: initialCredits,
      alerts: [],
      systemAccessEnabled: false,
      commandWhitelist: ['ls', 'pwd', 'cd', 'cat', 'echo', 'mkdir', 'touch', 'rm', 'cp', 'mv'],
      recentCommands: [],
      isSidebarOpen: true,
      isTemplateModalOpen: false,
      isStatsModalOpen: false,
      isSettingsModalOpen: false,
      isCreditsModalOpen: false,
      activeTemplate: null,
      isLoading: false,
      isStreaming: false,
      modelStats: [],
      theme: 'dark',
      
      // Actions - Conversations
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      
      setConversations: (conversations) => set({ conversations }),
      
      addConversation: (conversation) => 
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversation: conversation,
        })),
      
      updateConversation: (conversation) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversation.id ? conversation : c
          ),
          currentConversation: 
            state.currentConversation?.id === conversation.id 
              ? conversation 
              : state.currentConversation,
        })),
      
      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversation: 
            state.currentConversation?.id === id 
              ? null 
              : state.currentConversation,
        })),
      
      // Actions - Models
      selectModel: (model) => {
        const { isModelAvailable } = get();
        if (isModelAvailable(model)) {
          set({ selectedModel: model });
        }
      },
      
      setApiKeyForModel: (model, apiKey) =>
        set((state) => {
          const newApiKeys = { ...state.apiKeys, [model]: apiKey };
          const newStatus = {
            ...state.modelStatus,
            [model]: {
              ...state.modelStatus[model],
              apiKey,
              isActive: apiKey.length > 0,
              lastTested: apiKey.length > 0 ? Date.now() : null,
            },
          };
          return { apiKeys: newApiKeys, modelStatus: newStatus };
        }),
      
      removeApiKeyForModel: (model) =>
        set((state) => {
          const newApiKeys = { ...state.apiKeys, [model]: '' };
          const newStatus = {
            ...state.modelStatus,
            [model]: {
              ...state.modelStatus[model],
              apiKey: '',
              isActive: false,
              lastTested: null,
            },
          };
          // If removing key from currently selected model, switch to another available
          let newSelectedModel = state.selectedModel;
          if (state.selectedModel === model) {
            const available = Object.entries(newStatus)
              .filter(([_, s]) => s.isActive)
              .map(([m]) => m as GeminiModel);
            newSelectedModel = available[0] || state.selectedModel;
          }
          return { 
            apiKeys: newApiKeys, 
            modelStatus: newStatus,
            selectedModel: newSelectedModel,
          };
        }),
      
      updateModelStatus: (model, status) =>
        set((state) => ({
          modelStatus: {
            ...state.modelStatus,
            [model]: { ...state.modelStatus[model], ...status },
          },
        })),
      
      isModelAvailable: (model) => {
        const state = get();
        return state.modelStatus[model]?.isActive || false;
      },
      
      getAvailableModels: () => {
        const state = get();
        return (Object.keys(state.modelStatus) as GeminiModel[])
          .filter(m => state.modelStatus[m].isActive);
      },
      
      // Actions - Messages
      addMessageToCurrent: (message) =>
        set((state) => {
          if (!state.currentConversation) return state;
          
          const updatedConv = {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, message],
            updatedAt: Date.now(),
          };
          
          return {
            currentConversation: updatedConv,
            conversations: state.conversations.map((c) =>
              c.id === updatedConv.id ? updatedConv : c
            ),
          };
        }),
      
      updateLastMessage: (content, tokens, cost) =>
        set((state) => {
          if (!state.currentConversation) return state;
          
          const messages = [...state.currentConversation.messages];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content,
              tokens,
              cost,
            };
          }
          
          const updatedConv = {
            ...state.currentConversation,
            messages,
            updatedAt: Date.now(),
          };
          
          // Add spend to credits
          const spendAmount = cost || 0;
          const newCredits = {
            ...state.credits,
            totalSpent: state.credits.totalSpent + spendAmount,
            currentSessionSpend: state.credits.currentSessionSpend + spendAmount,
          };
          
          return {
            currentConversation: updatedConv,
            conversations: state.conversations.map((c) =>
              c.id === updatedConv.id ? updatedConv : c
            ),
            credits: newCredits,
          };
        }),
      
      // Actions - Credits
      addSpend: (amount) =>
        set((state) => ({
          credits: {
            ...state.credits,
            totalSpent: state.credits.totalSpent + amount,
            currentSessionSpend: state.credits.currentSessionSpend + amount,
          },
        })),
      
      resetSessionSpend: () =>
        set((state) => ({
          credits: { ...state.credits, currentSessionSpend: 0 },
        })),
      
      setDailyLimit: (limit) =>
        set((state) => ({
          credits: { ...state.credits, dailyLimit: limit },
        })),
      
      setMonthlyLimit: (limit) =>
        set((state) => ({
          credits: { ...state.credits, monthlyLimit: limit },
        })),
      
      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, alert],
        })),
      
      clearAlerts: () => set({ alerts: [] }),
      
      getSpendPercentage: () => {
        const state = get();
        return (state.credits.currentSessionSpend / state.credits.dailyLimit) * 100;
      },
      
      getTotalSpend: () => {
        return get().credits.totalSpent;
      },
      
      // Actions - System
      setSystemAccessEnabled: (enabled) =>
        set({ systemAccessEnabled: enabled }),
      
      addCommandToWhitelist: (command) =>
        set((state) => ({
          commandWhitelist: [...state.commandWhitelist, command],
        })),
      
      removeCommandFromWhitelist: (command) =>
        set((state) => ({
          commandWhitelist: state.commandWhitelist.filter(c => c !== command),
        })),
      
      addRecentCommand: (response) =>
        set((state) => ({
          recentCommands: [response, ...state.recentCommands].slice(0, 50),
        })),
      
      clearRecentCommands: () => set({ recentCommands: [] }),
      
      // Actions - UI
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setTemplateModalOpen: (open) => set({ isTemplateModalOpen: open }),
      setStatsModalOpen: (open) => set({ isStatsModalOpen: open }),
      setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
      setCreditsModalOpen: (open) => set({ isCreditsModalOpen: open }),
      setActiveTemplate: (template) => set({ activeTemplate: template }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setStreaming: (streaming) => set({ isStreaming: streaming }),
      
      setModelStats: (stats) => set({ modelStats: stats }),
      
      setTheme: (theme) => set({ theme }),
      
      // Computed
      getEstimatedCost: (inputTokens, outputTokens) => {
        const model = MODELS[get().selectedModel];
        const inputCost = (inputTokens / 1_000_000) * model.costPer1MInput;
        const outputCost = (outputTokens / 1_000_000) * model.costPer1MOutput;
        return Number((inputCost + outputCost).toFixed(6));
      },
    }),
    {
      name: 'gemini-app-storage',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        apiKeys: state.apiKeys,
        modelStatus: state.modelStatus,
        credits: state.credits,
        systemAccessEnabled: state.systemAccessEnabled,
        commandWhitelist: state.commandWhitelist,
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
