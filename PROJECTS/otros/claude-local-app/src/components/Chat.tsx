import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { Sidebar } from './Sidebar';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ModelSelector } from './ModelSelector';
import { TemplateModal } from './TemplateModal';
import { StatsModal } from './StatsModal';
import { SettingsModal } from './SettingsModal';
import { CreditsPanel } from './CreditsPanel';
import { Plus, Settings, DollarSign } from 'lucide-react';
import type { SystemCommandResponse } from '@/types';

export const Chat: React.FC = () => {
  const {
    currentConversation,
    conversations,
    selectedModel,
    systemAccessEnabled,
    addRecentCommand,
    setCurrentConversation,
    setConversations,
    addMessageToCurrent,
    updateLastMessage,
    setLoading,
    setStreaming,
    setSettingsModalOpen,
  } = useAppStore();

  // Load conversations on mount
  React.useEffect(() => {
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data);
      });
  }, []);

  const handleNewChat = () => {
    setCurrentConversation(null);
  };

  // Check if message is a system command
  const isSystemCommand = (message: string): boolean => {
    const trimmed = message.trim();
    return trimmed.startsWith('!') || trimmed.startsWith('/cmd ');
  };

  // Extract command from message
  const extractCommand = (message: string): string => {
    const trimmed = message.trim();
    if (trimmed.startsWith('!')) {
      return trimmed.slice(1).trim();
    }
    if (trimmed.startsWith('/cmd ')) {
      return trimmed.slice(5).trim();
    }
    return trimmed;
  };

  // Execute system command
  const executeSystemCommand = async (command: string): Promise<SystemCommandResponse> => {
    // Try using Electron's exposed API first (if running in Electron)
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.execCommand(command);
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executedAt: Date.now(),
        duration: 0,
      };
    }
    
    // Fallback to API endpoint
    const response = await fetch('/api/system-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, timeout: 30000 }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Command execution failed');
    }
    
    return await response.json();
  };

  const handleSend = async (message: string) => {
    setLoading(true);

    // Check if this is a system command
    if (isSystemCommand(message)) {
      if (!systemAccessEnabled) {
        // Add user message
        addMessageToCurrent({
          id: Date.now().toString(),
          role: 'user' as const,
          content: message,
          timestamp: Date.now(),
        });
        
        // Add error response
        addMessageToCurrent({
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: '⚠️ **System access is disabled**\n\nTo enable system commands:\n1. Open Settings (Cmd+,)\n2. Enable "System Access"\n3. Configure command whitelist',
          timestamp: Date.now(),
          model: selectedModel,
        });
        
        setLoading(false);
        return;
      }

      const command = extractCommand(message);
      
      // Add user message
      addMessageToCurrent({
        id: Date.now().toString(),
        role: 'user' as const,
        content: message,
        timestamp: Date.now(),
      });

      try {
        const result = await executeSystemCommand(command);
        
        // Format command output
        const output = result.stdout || result.stderr || '(no output)';
        const formattedOutput = `\`\`\`bash\n$ ${command}\n${output}\n\`\`\`\n\n*Exit code: ${result.exitCode} | Duration: ${result.duration}ms*`;
        
        addMessageToCurrent({
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: formattedOutput,
          timestamp: Date.now(),
          model: selectedModel,
        });
        
        addRecentCommand(result);
      } catch (error) {
        addMessageToCurrent({
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `❌ **Command failed**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          model: selectedModel,
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal chat message flow
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: Date.now(),
    };
    addMessageToCurrent(userMessage);

    // Add placeholder for assistant
    const assistantId = (Date.now() + 1).toString();
    addMessageToCurrent({
      id: assistantId,
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      model: selectedModel,
    });

    setStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          model: selectedModel,
          conversationId: currentConversation?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Update with full response
      updateLastMessage(
        data.message.content,
        data.message.tokens,
        data.message.cost
      );

      // If new conversation, refresh list
      if (!currentConversation && data.conversationId) {
        fetch(`/api/conversations?id=${data.conversationId}`)
          .then(res => res.json())
          .then(conv => {
            setCurrentConversation(conv);
            setConversations(prev => [conv, ...prev]);
          });
      }
    } catch (error) {
      updateLastMessage(
        'Error: No se pudo conectar con Gemini. Verifica tu API key e intenta nuevamente.',
        undefined,
        0
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onNewChat={handleNewChat} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            {currentConversation && (
              <div className="flex flex-col">
                <span className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">
                  {currentConversation.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {currentConversation.messages.length} mensajes
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => useAppStore.getState().setCreditsModalOpen(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-1"
              title="Credits & Spending"
            >
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ${useAppStore.getState().credits.currentSessionSpend.toFixed(2)}
              </span>
            </button>
            <ModelSelector />
          </div>
        </header>

        {/* Messages */}
        <MessageList 
          messages={currentConversation?.messages || []} 
        />

        {/* Input */}
        <ChatInput onSend={handleSend} />
      </main>

      {/* Modals */}
      <TemplateModal />
      <StatsModal />
      <SettingsModal />
      <CreditsPanel />
    </div>
  );
};
