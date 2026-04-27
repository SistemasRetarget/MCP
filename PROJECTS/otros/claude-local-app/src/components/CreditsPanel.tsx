import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { DollarSign, TrendingUp, AlertTriangle, X, Settings, Zap } from 'lucide-react';

export const CreditsPanel: React.FC = () => {
  const {
    isCreditsModalOpen,
    setCreditsModalOpen,
    credits,
    alerts,
    clearAlerts,
    getTotalSpend,
    setDailyLimit,
    setMonthlyLimit,
  } = useAppStore();

  const [newDailyLimit, setNewDailyLimit] = React.useState(credits.dailyLimit.toString());
  const [newMonthlyLimit, setNewMonthlyLimit] = React.useState(credits.monthlyLimit.toString());

  if (!isCreditsModalOpen) return null;

  const spendPercentage = (credits.currentSessionSpend / credits.dailyLimit) * 100;
  const totalSpend = getTotalSpend();

  const getBarColor = () => {
    if (spendPercentage >= 90) return 'bg-red-500';
    if (spendPercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSaveLimits = () => {
    setDailyLimit(parseFloat(newDailyLimit) || 10);
    setMonthlyLimit(parseFloat(newMonthlyLimit) || 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Credits & Monetization
          </h2>
          <button
            onClick={() => setCreditsModalOpen(false)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Spend */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Session Spend</p>
              <p className="text-2xl font-bold text-foreground">
                ${credits.currentSessionSpend.toFixed(4)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalSpend.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Daily Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Budget</span>
              <span className="text-sm text-muted-foreground">
                ${credits.currentSessionSpend.toFixed(4)} / ${credits.dailyLimit.toFixed(2)}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getBarColor()}`}
                style={{ width: `${Math.min(spendPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {spendPercentage.toFixed(1)}% of daily limit used
            </p>
          </div>

          {/* Spending Limits */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Spending Limits
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Daily Limit ($)
                </label>
                <input
                  type="number"
                  value={newDailyLimit}
                  onChange={(e) => setNewDailyLimit(e.target.value)}
                  onBlur={handleSaveLimits}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  value={newMonthlyLimit}
                  onChange={(e) => setNewMonthlyLimit(e.target.value)}
                  onBlur={handleSaveLimits}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  Spending Alerts
                </h3>
                <button
                  onClick={clearAlerts}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm"
                >
                  <p className="font-medium">{alert.type === 'threshold' ? 'Threshold Alert' : `${alert.type} limit reached`}</p>
                  <p className="text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Model Prices */}
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Current Model Pricing
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flash 8B</span>
                <span>$0.0375 / 1M tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flash</span>
                <span>$0.075 / 1M tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pro</span>
                <span>$1.25 / 1M tokens</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            Costs are estimated based on token usage. Actual billing may vary.
            Set up alerts to monitor your spending.
          </p>
        </div>
      </div>
    </div>
  );
};
