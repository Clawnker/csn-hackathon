'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, CheckCircle2, XCircle, Search, Clock } from 'lucide-react';
import type { QueryHistoryItem } from '@/types';

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onReRun: (prompt: string) => void;
  className?: string;
}

const SPECIALIST_NAMES: Record<string, string> = {
  aura: 'Aura',
  magos: 'Magos',
  bankr: 'Bankr',
  general: 'Assistant',
  alphahunter: 'AlphaHunter',
  riskbot: 'RiskBot',
  newsdigest: 'NewsDigest',
  whalespy: 'WhaleSpy',
  scribe: 'Scribe',
  seeker: 'Seeker',
  dispatcher: 'Dispatcher',
};

export function QueryHistory({ history, onReRun, className = '' }: QueryHistoryProps) {
  const formatTime = (date: Date | string) => {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (e) {
      return 'just now';
    }
  };

  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  };

  return (
    <div className={`glass-panel overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[var(--accent-cyan)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Query History</span>
        </div>
        {history.length > 0 && (
          <span className="text-xs text-[var(--text-muted)]">
            {history.length} items
          </span>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: '400px' }}>
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <History size={32} className="text-[var(--text-muted)] mb-2" />
              <p className="text-sm text-[var(--text-muted)]">
                No history yet
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Your past queries will appear here
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel-subtle p-3 hover:bg-white/5 transition-all group relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate block">
                          "{truncate(item.prompt, 100)}"
                        </span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                          <Search size={10} />
                          {SPECIALIST_NAMES[item.specialist] || item.specialist}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          {item.cost.toFixed(4)} USDC
                        </span>
                        <span>•</span>
                        <span className={`flex items-center gap-1 ${item.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {item.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {item.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onReRun(item.prompt)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-[var(--accent-cyan)] hover:text-black transition-all text-[var(--text-muted)]"
                      title="Re-run query"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
