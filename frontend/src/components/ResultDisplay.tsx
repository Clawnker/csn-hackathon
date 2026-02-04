'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import type { TaskStatus } from '@/types';

interface ResultDisplayProps {
  taskStatus: TaskStatus | null;
  result: unknown;
  error?: string;
  className?: string;
}

export function ResultDisplay({ taskStatus, result, error, className = '' }: ResultDisplayProps) {
  const formatResult = (data: unknown): string => {
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (!taskStatus && !result && !error) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`glass-panel overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--glass-border)]">
          {taskStatus === 'completed' ? (
            <>
              <CheckCircle size={16} className="text-[var(--accent-green)]" />
              <span className="text-sm font-medium text-[var(--accent-green)]">
                Task Completed
              </span>
            </>
          ) : taskStatus === 'failed' ? (
            <>
              <XCircle size={16} className="text-[var(--accent-red)]" />
              <span className="text-sm font-medium text-[var(--accent-red)]">
                Task Failed
              </span>
            </>
          ) : taskStatus === 'executing' || taskStatus === 'planning' ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 size={16} className="text-[var(--accent-cyan)]" />
              </motion.div>
              <span className="text-sm font-medium text-[var(--accent-cyan)]">
                {taskStatus === 'planning' ? 'Planning...' : 'Executing...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-[var(--accent-purple)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Result
              </span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="p-4 rounded-lg bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20">
              <p className="text-sm text-[var(--accent-red)]">{error}</p>
            </div>
          ) : taskStatus === 'executing' || taskStatus === 'planning' ? (
            <div className="flex items-center gap-3">
              <motion.div
                className="flex gap-1"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
              <span className="text-sm text-[var(--text-secondary)]">
                {taskStatus === 'planning' 
                  ? 'Analyzing prompt and creating execution plan...'
                  : 'Agents are working on your request...'}
              </span>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {typeof result === 'object' && result !== null && 'summary' in (result as Record<string, unknown>) ? (
                <div className="space-y-3">
                  <p className="text-[var(--text-primary)]">
                    {(result as { summary: string }).summary}
                  </p>
                  {'details' in (result as Record<string, unknown>) && (
                    <pre className="p-3 rounded-lg bg-[var(--bg-primary)] text-xs 
                      font-mono text-[var(--text-secondary)] overflow-x-auto">
                      {formatResult((result as { details: unknown }).details)}
                    </pre>
                  )}
                </div>
              ) : (
                <pre className="p-3 rounded-lg bg-[var(--bg-primary)] text-sm 
                  font-mono text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap">
                  {formatResult(result)}
                </pre>
              )}
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
