import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { MODELS } from '@/types';
import { User, Bot, Copy, Check, Coins } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    model?: string;
    tokens?: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    };
    cost?: number;
  }>;
  isStreaming?: boolean;
}

const CodeBlock: React.FC<{ language: string; children: string }> = ({ language, children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs text-muted-foreground uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { selectedModel } = useAppStore();

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">¿En qué puedo ayudarte hoy?</h2>
          <p className="text-muted-foreground max-w-md">
            Selecciona un modelo según tu necesidad: Haiku para tareas rápidas, 
            Sonnet para balance, o Opus para decisiones arquitectónicas complejas.
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const isLast = index === messages.length - 1;
            const showModel = !isUser && message.model;
            const modelConfig = showModel ? MODELS[message.model as keyof typeof MODELS] : null;

            return (
              <div
                key={message.id}
                className={`flex gap-4 message-enter ${isUser ? 'flex-row-reverse' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {isUser ? 'Tú' : 'Claude'}
                    </span>
                    {showModel && modelConfig && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${modelConfig.color}20`, color: modelConfig.color }}
                      >
                        {modelConfig.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <div
                    className={`inline-block text-left rounded-2xl px-4 py-3 ${
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content + (isLast && isStreaming ? '▌' : '')}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {message.tokens && message.cost !== undefined && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{message.tokens.total_tokens.toLocaleString()} tokens</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        ${message.cost.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
