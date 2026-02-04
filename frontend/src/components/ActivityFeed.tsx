'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Zap,
  ExternalLink,
  Bot
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'dispatch' | 'processing' | 'payment' | 'result' | 'error';
  message: string;
  timestamp: Date;
  specialist?: string;
  link?: string;
  details?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isProcessing: boolean;
}

const SPECIALIST_COLORS: Record<string, string> = {
  dispatcher: '#F7B32B',
  aura: '#a855f7',
  magos: '#ec4899',
  bankr: '#22c55e',
};

function getIcon(type: ActivityItem['type'], isLast: boolean) {
  switch (type) {
    case 'dispatch':
      return <Bot size={16} className="text-[#F7B32B]" />;
    case 'processing':
      return isLast ? (
        <Loader2 size={16} className="text-[#00F0FF] animate-spin" />
      ) : (
        <CheckCircle size={16} className="text-[#22c55e]" />
      );
    case 'payment':
      return <Zap size={16} className="text-[#F7B32B]" />;
    case 'result':
      return <CheckCircle size={16} className="text-[#22c55e]" />;
    case 'error':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <ArrowRight size={16} className="text-[var(--text-muted)]" />;
  }
}

export function ActivityFeed({ items, isProcessing }: ActivityFeedProps) {
  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-[#F7B32B]" />
        <span className="text-sm font-medium text-[var(--text-primary)]">Activity</span>
        {isProcessing && (
          <span className="ml-auto text-xs text-[#00F0FF] flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Processing
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-[var(--text-muted)] text-sm"
            >
              Submit a task to see activity
            </motion.div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="mt-0.5">
                  {getIcon(item.type, index === items.length - 1 && isProcessing)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    {item.specialist && (
                      <span 
                        className="font-semibold mr-1"
                        style={{ color: SPECIALIST_COLORS[item.specialist] || '#F7B32B' }}
                      >
                        {item.specialist}
                      </span>
                    )}
                    {item.message}
                  </p>
                  {item.details && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {item.details}
                    </p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 mt-1"
                    >
                      View transaction
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
}

export type { ActivityItem };
