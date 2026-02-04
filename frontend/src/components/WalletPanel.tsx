'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import type { WalletBalance } from '@/types';

interface WalletPanelProps {
  className?: string;
}

// Mock wallet data - in production this would come from the backend
const MOCK_WALLET: WalletBalance = {
  address: '5xUugg8ysgqpcGneM6qpM2AZ8ZGuMaH5TnGNWdCQC1Z1',
  SOL: 2.847,
  USDC: 156.42,
};

export function WalletPanel({ className = '' }: WalletPanelProps) {
  const [wallet, setWallet] = useState<WalletBalance>(MOCK_WALLET);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In production, fetch from backend
    setIsRefreshing(false);
  };

  const openExplorer = () => {
    window.open(
      `https://explorer.solana.com/address/${wallet.address}?cluster=devnet`,
      '_blank'
    );
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(refreshBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-[var(--accent-green)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Agent Wallet</span>
        </div>
        <motion.button
          onClick={refreshBalance}
          disabled={isRefreshing}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] 
            transition-colors disabled:opacity-50"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
          >
            <RefreshCw size={14} />
          </motion.div>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Address</span>
          <div className="flex items-center gap-2">
            <code className="text-xs text-[var(--text-secondary)] font-mono">
              {truncateAddress(wallet.address)}
            </code>
            <motion.button
              onClick={copyAddress}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={12} className="text-[var(--accent-green)]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy size={12} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              onClick={openExplorer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
            >
              <ExternalLink size={12} />
            </motion.button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          {/* SOL Balance */}
          <motion.div
            className="glass-panel-subtle p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">◎</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">SOL</span>
            </div>
            <motion.span
              key={wallet.SOL}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-[var(--text-primary)]"
            >
              {wallet.SOL.toFixed(3)}
            </motion.span>
          </motion.div>

          {/* USDC Balance */}
          <motion.div
            className="glass-panel-subtle p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-[#2775CA] flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">$</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">USDC</span>
            </div>
            <motion.span
              key={wallet.USDC}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-[var(--text-primary)]"
            >
              ${wallet.USDC.toFixed(2)}
            </motion.span>
          </motion.div>
        </div>

        {/* Network indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-purple)]" />
          <span>Devnet</span>
        </div>
      </div>
    </div>
  );
}
