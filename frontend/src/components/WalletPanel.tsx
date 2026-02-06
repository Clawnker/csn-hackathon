'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, Check, ExternalLink, RefreshCw, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface WalletPanelProps {
  className?: string;
}

interface TokenBalance {
  symbol: string;
  amount: number;
  icon: string;
  color: string;
}

const TREASURY_ADDRESS = '5xUugg8ysgqpcGneM6qpM2AZ8ZGuMaH5TnGNWdCQC1Z1';
const AGENTWALLET_USERNAME = 'claw';

// Token display config
const TOKEN_CONFIG: Record<string, { icon: string; color: string; decimals: number }> = {
  SOL: { icon: '◎', color: 'from-[#9945FF] to-[#14F195]', decimals: 4 },
  USDC: { icon: '$', color: 'from-[#2775CA] to-[#2775CA]', decimals: 4 },
  BONK: { icon: '🐕', color: 'from-[#F5A623] to-[#F5841F]', decimals: 0 },
  WIF: { icon: '🐶', color: 'from-[#8B5CF6] to-[#EC4899]', decimals: 2 },
  JUP: { icon: '🪐', color: 'from-[#00D18C] to-[#00A67E]', decimals: 4 },
};

export function WalletPanel({ className = '' }: WalletPanelProps) {
  const [tokens, setTokens] = useState<TokenBalance[]>([
    { symbol: 'SOL', amount: 0, icon: '◎', color: 'from-[#9945FF] to-[#14F195]' },
    { symbol: 'USDC', amount: 0, icon: '$', color: 'from-[#2775CA] to-[#2775CA]' },
  ]);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showAllTokens, setShowAllTokens] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(TREASURY_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchBalance = async () => {
    setIsRefreshing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/wallet/balances`);
      if (response.ok) {
        const data = await response.json();
        
        // Build token list from response
        const newTokens: TokenBalance[] = [];
        const solana = data.solana || {};
        
        // Always show SOL and USDC first
        const sol = solana.sol || 0;
        const usdc = solana.usdc || 0;
        
        newTokens.push({
          symbol: 'SOL',
          amount: sol,
          icon: TOKEN_CONFIG.SOL.icon,
          color: TOKEN_CONFIG.SOL.color,
        });
        
        newTokens.push({
          symbol: 'USDC',
          amount: usdc,
          icon: TOKEN_CONFIG.USDC.icon,
          color: TOKEN_CONFIG.USDC.color,
        });
        
        // Add other tokens with non-zero balances
        Object.entries(solana).forEach(([key, value]) => {
          const symbol = key.toUpperCase();
          if (symbol !== 'SOL' && symbol !== 'USDC' && (value as number) > 0) {
            const config = TOKEN_CONFIG[symbol] || { 
              icon: '🪙', 
              color: 'from-gray-500 to-gray-600',
              decimals: 4 
            };
            newTokens.push({
              symbol,
              amount: value as number,
              icon: config.icon,
              color: config.color,
            });
          }
        });
        
        setTokens(newTokens);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
    setIsRefreshing(false);
  };

  const openSolscan = () => {
    window.open(
      `https://solscan.io/account/${TREASURY_ADDRESS}?cluster=devnet`,
      '_blank'
    );
  };

  const openAgentWallet = () => {
    window.open(
      `https://agentwallet.mcpay.tech/u/${AGENTWALLET_USERNAME}`,
      '_blank'
    );
  };

  // Format balance for display
  const formatBalance = (symbol: string, amount: number): string => {
    const config = TOKEN_CONFIG[symbol] || { decimals: 4 };
    if (symbol === 'BONK' || amount > 10000) {
      // Use compact notation for large numbers
      if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
      } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
      }
    }
    return amount.toFixed(config.decimals);
  };

  // Fetch on mount and every 15 seconds
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, []);

  // Determine which tokens to show
  const primaryTokens = tokens.slice(0, 2); // SOL and USDC
  const additionalTokens = tokens.slice(2);
  const hasAdditionalTokens = additionalTokens.length > 0;

  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-[var(--accent-green)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Agent Wallet</span>
        </div>
        <motion.button
          onClick={fetchBalance}
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
          <span className="text-xs text-[var(--text-muted)]">Treasury</span>
          <div className="flex items-center gap-2">
            <code className="text-xs text-[var(--text-secondary)] font-mono">
              {truncateAddress(TREASURY_ADDRESS)}
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
              onClick={openSolscan}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
              title="View on Solscan"
            >
              <ExternalLink size={12} />
            </motion.button>
          </div>
        </div>

        {/* Primary Balances (SOL + USDC) */}
        <div className="grid grid-cols-2 gap-3">
          {primaryTokens.map((token) => (
            <motion.div
              key={token.symbol}
              className="glass-panel-subtle p-3 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center`}>
                  <span className="text-[8px] font-bold text-white">{token.icon}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{token.symbol}</span>
              </div>
              <motion.span
                key={token.amount}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-semibold text-[var(--text-primary)]"
              >
                {token.symbol === 'USDC' ? '$' : ''}{formatBalance(token.symbol, token.amount)}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Additional Tokens (expandable) */}
        {hasAdditionalTokens && (
          <>
            <motion.button
              onClick={() => setShowAllTokens(!showAllTokens)}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-[var(--accent-cyan)] hover:text-[var(--accent-cyan-bright)] transition-colors"
            >
              <span>{showAllTokens ? 'Hide' : 'Show'} {additionalTokens.length} more token{additionalTokens.length > 1 ? 's' : ''}</span>
              {showAllTokens ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </motion.button>
            
            <AnimatePresence>
              {showAllTokens && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {additionalTokens.map((token) => (
                      <motion.div
                        key={token.symbol}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel-subtle p-3 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center`}>
                            <span className="text-[10px]">{token.icon}</span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">{token.symbol}</span>
                        </div>
                        <motion.span
                          key={token.amount}
                          className="text-lg font-semibold text-[var(--text-primary)]"
                        >
                          {formatBalance(token.symbol, token.amount)}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Footer Links */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)]">
          <motion.button
            onClick={openSolscan}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
          >
            <ExternalLink size={10} />
            <span>Solscan</span>
          </motion.button>
          
          <motion.button
            onClick={openAgentWallet}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-1 text-xs text-[var(--accent-purple)] hover:text-[var(--accent-purple-bright)] transition-colors"
          >
            <Activity size={10} />
            <span>View Activity</span>
          </motion.button>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-purple)]" />
            <span>Solana Devnet</span>
          </div>
          {lastUpdated && (
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
