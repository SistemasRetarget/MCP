import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Settings, 
  BarChart3, 
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { formatDistanceToNow } from '@/utils/date';

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    removeConversation,
    isSidebarOpen,
    setSidebarOpen,
    setStatsModalOpen,
    setTemplateModalOpen,
  } = useAppStore();

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeConversation(id);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Claude Local</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1 hover:bg-accent rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setCurrentConversation(conv)}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`w-full text-left p-3 rounded-lg transition-colors group relative ${
                currentConversation?.id === conv.id
                  ? 'bg-accent'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(conv.updatedAt)}
                  </p>
                </div>
                {hoveredId === conv.id && (
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </button>
          ))}

          {conversations.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No hay conversaciones aún
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setStatsModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </button>
        </div>
      </aside>

      {/* Toggle button (visible when sidebar closed on desktop) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed lg:static left-4 top-4 z-30 lg:z-auto p-2 bg-card border border-border rounded-lg shadow-sm hover:bg-accent transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
};
