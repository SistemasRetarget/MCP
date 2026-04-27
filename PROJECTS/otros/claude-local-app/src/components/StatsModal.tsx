import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { MODELS } from '@/types';
import { X, Coins, TrendingUp, BarChart2 } from 'lucide-react';

export const StatsModal: React.FC = () => {
  const { isStatsModalOpen, setStatsModalOpen, modelStats } = useAppStore();
  const [dailyStats, setDailyStats] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (isStatsModalOpen) {
      fetch('/api/stats?type=all&days=30')
        .then(res => res.json())
        .then(data => {
          if (data.daily) setDailyStats(data.daily);
        });
    }
  }, [isStatsModalOpen]);

  if (!isStatsModalOpen) return null;

  const totalCost = modelStats.reduce((acc, s) => acc + s.totalCost, 0);
  const totalTokens = modelStats.reduce((acc, s) => acc + s.totalInputTokens + s.totalOutputTokens, 0);
  const totalRequests = modelStats.reduce((acc, s) => acc + s.totalRequests, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Estadísticas de Uso
          </h2>
          <button
            onClick={() => setStatsModalOpen(false)}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Coins className="w-4 h-4" />
                <span className="text-sm">Costo Total</span>
              </div>
              <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Total Tokens</span>
              </div>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart2 className="w-4 h-4" />
                <span className="text-sm">Requests</span>
              </div>
              <p className="text-2xl font-bold">{totalRequests}</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <h3 className="font-semibold mb-3">Uso por Modelo</h3>
          <div className="space-y-3 mb-6">
            {modelStats.map(stat => {
              const model = MODELS[stat.model];
              const percentage = totalCost > 0 ? (stat.totalCost / totalCost) * 100 : 0;
              
              return (
                <div key={stat.model} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stat.totalRequests} requests
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {stat.totalInputTokens.toLocaleString()} in / {stat.totalOutputTokens.toLocaleString()} out
                    </span>
                    <span className="font-medium">${stat.totalCost.toFixed(4)}</span>
                  </div>
                  <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: model.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
            
            {modelStats.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay datos de uso aún
              </p>
            )}
          </div>

          {/* Cost Reference */}
          <h3 className="font-semibold mb-3">Tarifas por Modelo</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(MODELS).map(([key, model]) => (
              <div key={key} className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <span className="font-medium text-sm">{model.name}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Input: ${model.costPer1MInput}/1M</p>
                  <p>Output: ${model.costPer1MOutput}/1M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
