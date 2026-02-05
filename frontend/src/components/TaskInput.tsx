'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Coins } from 'lucide-react';
import { CostPreview } from './CostPreview';
import { SpecialistPricing, SpecialistType } from '../types';

interface TaskInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pricing, setPricing] = useState<Record<string, SpecialistPricing> | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistType>('general');

  // Fetch pricing on mount
  useEffect(() => {
    fetch(`${API_URL}/pricing`)
      .then(res => res.json())
      .then(data => setPricing(data.pricing))
      .catch(err => console.error('Failed to fetch pricing:', err));
  }, []);

  // Simplified routing logic (matching backend)
  const routePrompt = (p: string): SpecialistType => {
    const lower = p.toLowerCase();
    if (lower.includes('good buy') || lower.includes('should i') || lower.includes('recommend') || /is \w+ a good/.test(lower)) {
      return 'magos';
    }
    if (lower.includes('talking about') || lower.includes('mentions') || lower.includes('discussing')) {
      return 'aura';
    }
    if (lower.includes('swap') || lower.includes('trade') || lower.includes('buy') || lower.includes('sell') || lower.includes('balance') || lower.includes('wallet')) {
      return 'bankr';
    }
    return 'general';
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      const specialist = routePrompt(prompt);
      setSelectedSpecialist(specialist);
      setShowPreview(true);
      setIsConfirmed(false);
    }
  };

  const handleDispatch = () => {
    if (isConfirmed && prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
      setShowPreview(false);
      setIsConfirmed(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
    const specialist = routePrompt(text);
    setSelectedSpecialist(specialist);
    setShowPreview(true);
    setIsConfirmed(false);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (showPreview) {
      setShowPreview(false);
      setIsConfirmed(false);
    }
  };

  return (
    <div className="w-full">
      {/* Main Input */}
      <div className="space-y-4">
        <form onSubmit={handleInitialSubmit} className="relative">
          <div className="glass-panel gradient-border overflow-hidden">
            <div className="relative flex items-center p-2">
              <input
                type="text"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="What would you like the swarm to do?"
                disabled={isLoading || disabled}
                className="flex-1 bg-transparent px-4 py-3 text-lg text-[var(--text-primary)] 
                  placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50"
              />
              {!showPreview ? (
                <motion.button
                  type="submit"
                  disabled={!prompt.trim() || isLoading || disabled}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                    disabled:transform-none"
                >
                  <Sparkles size={18} />
                  <span>Analyze</span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleDispatch}
                  disabled={!isConfirmed || isLoading || disabled}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex items-center gap-2 py-2 px-6 rounded-xl font-bold transition-all
                    ${isConfirmed 
                      ? 'bg-[var(--gradient-primary)] text-[var(--bg-primary)] shadow-[var(--glow-gold)]' 
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed'}
                  `}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-[var(--bg-primary)] border-t-transparent rounded-full"
                    />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>Confirm & Dispatch</span>
                </motion.button>
              )}
            </div>
          </div>
        </form>

        <AnimatePresence>
          {showPreview && pricing && (
            <CostPreview
              pricing={pricing}
              specialist={selectedSpecialist}
              isConfirmed={isConfirmed}
              onConfirm={() => setIsConfirmed(!isConfirmed)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Suggested Prompts */}
      {!showPreview && (
        <motion.div 
          className="mt-4 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          exit={{ opacity: 0, y: -10 }}
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
      )}
    </div>
  );
}
