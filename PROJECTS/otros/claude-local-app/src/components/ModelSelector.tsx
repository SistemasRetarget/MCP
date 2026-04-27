import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { MODELS, type GeminiModel } from '@/types';
import { Zap, Bolt, Sparkles, ChevronDown } from 'lucide-react';

const modelIcons: Record<GeminiModel, React.ReactNode> = {
  'gemini-1.5-flash-8b': <Zap className="w-4 h-4" />,
  'gemini-1.5-flash': <Bolt className="w-4 h-4" />,
  'gemini-1.5-pro': <Sparkles className="w-4 h-4" />,
};

const modelSpeedLabels: Record<GeminiModel, string> = {
  'gemini-1.5-flash-8b': 'Ultra-rápido',
  'gemini-1.5-flash': 'Rápido',
  'gemini-1.5-pro': 'Pro',
};

export const ModelSelector: React.FC = () => {
  const { selectedModel, selectModel } = useAppStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (model: GeminiModel) => {
    selectModel(model);
    setIsOpen(false);
  };

  const currentModel = MODELS[selectedModel];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
      >
        <span style={{ color: currentModel.color }}>
          {modelIcons[selectedModel]}
        </span>
        <span className="font-medium text-sm">{currentModel.name}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 py-1">
          {(Object.keys(MODELS) as GeminiModel[]).map((model) => {
            const config = MODELS[model];
            const isSelected = model === selectedModel;
            
            return (
              <button
                key={model}
                onClick={() => handleSelect(model)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
                  isSelected ? 'bg-accent/50' : ''
                }`}
              >
                <span style={{ color: config.color }} className="mt-0.5">
                  {modelIcons[model]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{config.name}</span>
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded-full bg-muted"
                      style={{ color: config.color }}
                    >
                      {modelSpeedLabels[model]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {config.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>${config.costPer1MInput}/1M input</span>
                    <span>•</span>
                    <span>${config.costPer1MOutput}/1M output</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {config.useCases.slice(0, 2).map((use) => (
                      <span key={use} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
