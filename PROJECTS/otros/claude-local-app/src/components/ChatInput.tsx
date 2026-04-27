import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { Send, Loader2, Paperclip, Command } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { isLoading, isStreaming } = useAppStore();

  const handleSubmit = () => {
    if (!input.trim() || disabled || isLoading || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const isDisabled = disabled || isLoading || isStreaming;

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-muted rounded-xl border border-border p-3">
          <button
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            title="Adjuntar archivo (próximamente)"
            disabled
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
            className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[24px] max-h-[200px] py-2"
            rows={1}
            disabled={isDisabled}
          />

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted border border-border rounded text-muted-foreground">
              <Command className="w-3 h-3" />K
            </kbd>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isDisabled}
              className={`p-2 rounded-lg transition-all ${
                input.trim() && !isDisabled
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isLoading || isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Claude puede cometer errores. Verifica información importante.
        </p>
      </div>
    </div>
  );
};
