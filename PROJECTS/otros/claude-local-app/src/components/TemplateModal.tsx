import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { promptTemplates, fillTemplate, getTemplatesByCategory } from '@/data/templates';
import { X, Copy, Check, Layers, Code, Search, Bug, FileText } from 'lucide-react';
import type { TemplateCategory, PromptTemplate } from '@/types';

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  architecture: <Layers className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  review: <Search className="w-4 h-4" />,
  documentation: <FileText className="w-4 h-4" />,
  debugging: <Bug className="w-4 h-4" />,
  custom: <Copy className="w-4 h-4" />,
};

const categoryLabels: Record<TemplateCategory, string> = {
  architecture: 'Arquitectura',
  code: 'Código',
  review: 'Review',
  documentation: 'Documentación',
  debugging: 'Debugging',
  custom: 'Personalizado',
};

export const TemplateModal: React.FC = () => {
  const { isTemplateModalOpen, setTemplateModalOpen, selectModel, setCurrentConversation } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = React.useState<PromptTemplate | null>(null);
  const [variables, setVariables] = React.useState<Record<string, string>>({});
  const [filledTemplate, setFilledTemplate] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<TemplateCategory | 'all'>('all');

  React.useEffect(() => {
    if (selectedTemplate) {
      const filled = fillTemplate(selectedTemplate, variables);
      setFilledTemplate(filled);
    }
  }, [selectedTemplate, variables]);

  if (!isTemplateModalOpen) return null;

  const categories = [...new Set(promptTemplates.map(t => t.category))];
  const filteredTemplates = activeCategory === 'all' 
    ? promptTemplates 
    : getTemplatesByCategory(activeCategory);

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables
    const initialVars: Record<string, string> = {};
    template.variables.forEach(v => {
      initialVars[v] = '';
    });
    setVariables(initialVars);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filledTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    
    // Select the appropriate model
    selectModel(selectedTemplate.defaultModel);
    
    // Create a new conversation with the filled template
    setCurrentConversation(null);
    
    // Close modal
    setTemplateModalOpen(false);
    
    // The user will need to paste the filled content in the chat input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Templates de Prompts</h2>
          <button
            onClick={() => setTemplateModalOpen(false)}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-48 border-r border-border p-2 overflow-y-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                activeCategory === 'all' ? 'bg-accent' : 'hover:bg-muted'
              }`}
            >
              Todos ({promptTemplates.length})
            </button>
            {categories.map(cat => {
              const count = promptTemplates.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeCategory === cat ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                >
                  {categoryIcons[cat]}
                  {categoryLabels[cat]} ({count})
                </button>
              );
            })}
          </div>

          {/* Templates list */}
          <div className="w-64 border-r border-border overflow-y-auto">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`w-full text-left p-3 border-b border-border transition-colors ${
                  selectedTemplate?.id === template.id ? 'bg-accent' : 'hover:bg-muted'
                }`}
              >
                <p className="font-medium text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </button>
            ))}
          </div>

          {/* Template editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedTemplate ? (
              <>
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      Modelo recomendado: {selectedTemplate.defaultModel.split('-')[2]}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable}>
                      <label className="text-sm font-medium mb-1 block">
                        {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <textarea
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        className="w-full p-2 bg-muted rounded-lg border border-border text-sm min-h-[80px]"
                        placeholder={`Ingresa ${variable.replace(/_/g, ' ')}...`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-sm font-medium mb-1 block">Resultado</label>
                    <div className="relative">
                      <pre className="p-3 bg-muted rounded-lg border border-border text-sm max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                        {filledTemplate}
                      </pre>
                      <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 bg-card border border-border rounded hover:bg-accent transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex-1 px-4 py-2 bg-muted rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    Usar Template
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Selecciona un template para comenzar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
