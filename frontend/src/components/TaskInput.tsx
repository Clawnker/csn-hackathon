'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, TrendingUp, Coins } from 'lucide-react';

interface TaskInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    text: "Find trending meme coins on X",
    color: "cyan",
  },
  {
    icon: Zap,
    text: "Get 4h price prediction for BONK",
    color: "purple",
  },
  {
    icon: Coins,
    text: "Buy 0.1 SOL of the most bullish token",
    color: "pink",
  },
  {
    icon: Sparkles,
    text: "Analyze sentiment for WIF and trade if bullish",
    color: "green",
  },
];

export function TaskInput({ onSubmit, isLoading, disabled }: TaskInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="w-full">
      {/* Main Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel gradient-border overflow-hidden">
          <div className="relative flex items-center p-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like the swarm to do?"
              disabled={isLoading || disabled}
              className="flex-1 bg-transparent px-4 py-3 text-lg text-[var(--text-primary)] 
                placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={!prompt.trim() || isLoading || disabled}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                disabled:transform-none"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                    className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full"
                  />
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Send size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>{isLoading ? 'Processing...' : 'Execute'}</span>
            </motion.button>
          </div>
        </div>
      </form>

      {/* Suggested Prompts */}
      <motion.div 
        className="mt-4 flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {SUGGESTED_PROMPTS.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <motion.button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              disabled={isLoading || disabled}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`
                glass-panel-subtle flex items-center gap-2 px-3 py-2 text-sm
                text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                hover:border-[var(--accent-${suggestion.color})] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              `}
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <IconComponent 
                size={14} 
                style={{ 
                  color: suggestion.color === 'cyan' ? 'var(--accent-cyan)' :
                         suggestion.color === 'purple' ? 'var(--accent-purple)' :
                         suggestion.color === 'pink' ? 'var(--accent-pink)' :
                         'var(--accent-green)'
                }} 
              />
              <span>{suggestion.text}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
