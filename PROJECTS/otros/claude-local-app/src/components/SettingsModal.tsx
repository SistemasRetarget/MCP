import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { MODELS, type GeminiModel } from '@/types';
import { X, Key, Terminal, Shield, Check, AlertCircle } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    apiKeys,
    setApiKeyForModel,
    removeApiKeyForModel,
    modelStatus,
    systemAccessEnabled,
    setSystemAccessEnabled,
    commandWhitelist,
    addCommandToWhitelist,
    removeCommandFromWhitelist,
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<'api' | 'system'>('api');
  const [newCommand, setNewCommand] = React.useState('');

  if (!isSettingsModalOpen) return null;

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '...' + key.slice(-4);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Settings
          </h2>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'api'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className="w-4 h-4" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'system'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="w-4 h-4" />
            System Access
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'api' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Configure API keys for each Gemini model. Models without an API key will be disabled.
              </p>

              {(Object.keys(MODELS) as GeminiModel[]).map((model) => {
                const config = MODELS[model];
                const status = modelStatus[model];
                const hasKey = status?.isActive;

                return (
                  <div
                    key={model}
                    className={`p-4 rounded-lg border transition-colors ${
                      hasKey
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{config.name}</span>
                            {hasKey ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${config.costPer1MInput}/1M input • ${config.costPer1MOutput}/1M output
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Enter Gemini API key..."
                        value={apiKeys[model] || ''}
                        onChange={(e) => setApiKeyForModel(model, e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {hasKey && (
                        <button
                          onClick={() => removeApiKeyForModel(model)}
                          className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {status?.apiKey && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Key: {maskApiKey(status.apiKey)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* System Access Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Enable System Commands
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow AI to execute system commands from chat using !command or /cmd
                  </p>
                </div>
                <button
                  onClick={() => setSystemAccessEnabled(!systemAccessEnabled)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    systemAccessEnabled ? 'bg-green-500' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      systemAccessEnabled ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Command Whitelist */}
              <div>
                <h3 className="font-medium mb-3">Command Whitelist</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Only these commands can be executed for security
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {commandWhitelist.map((cmd) => (
                    <span
                      key={cmd}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      {cmd}
                      <button
                        onClick={() => removeCommandFromWhitelist(cmd)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add command..."
                    value={newCommand}
                    onChange={(e) => setNewCommand(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newCommand.trim()) {
                        addCommandToWhitelist(newCommand.trim());
                        setNewCommand('');
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => {
                      if (newCommand.trim()) {
                        addCommandToWhitelist(newCommand.trim());
                        setNewCommand('');
                      }
                    }}
                    disabled={!newCommand.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="p-4 rounded-lg bg-muted text-sm">
                <h4 className="font-medium mb-2">System Information</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Platform: {typeof window !== 'undefined' && (window as any).electronAPI?.platform}</p>
                  <p>Architecture: {typeof window !== 'undefined' && (window as any).electronAPI?.arch}</p>
                  <p>Home Directory: {typeof window !== 'undefined' && (window as any).electronAPI?.homedir}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
