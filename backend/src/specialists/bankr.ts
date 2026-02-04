/**
 * bankr Specialist
 * Expert in Solana transactions and wallet management
 * Executes trades, transfers, and DCA strategies
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import config from '../config';
import { BankrAction, SpecialistResult, PaymentInfo } from '../types';
import solana from '../solana';
import { x402Fetch } from '../x402';

const execAsync = promisify(exec);

/**
 * bankr specialist handler
 */
export const bankr = {
  name: 'bankr',
  description: 'Expert in Solana transactions, wallet management, and trading execution. Can execute swaps, transfers, DCA, and monitor positions.',
  
  /**
   * Main handler - parses prompt and routes to appropriate function
   */
  async handle(prompt: string): Promise<SpecialistResult> {
    const startTime = Date.now();
    
    try {
      const intent = parseIntent(prompt);
      
      let data: BankrAction;
      
      switch (intent.type) {
        case 'swap':
          data = await executeSwap(intent.from!, intent.to!, intent.amount!);
          break;
        case 'transfer':
          data = await executeTransfer(intent.to!, intent.amount!, intent.token);
          break;
        case 'balance':
          data = await checkBalance(intent.address);
          break;
        case 'dca':
          data = await setupDCA(intent.token!, intent.amount!, intent.frequency!);
          break;
        case 'monitor':
          data = await monitorAddress(intent.address!);
          break;
        default:
          data = await analyzeRequest(prompt);
      }

      return {
        success: true,
        data,
        confidence: 0.95, // bankr is deterministic
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
        cost: data.type === 'swap' || data.type === 'transfer' 
          ? { amount: '0.000005', currency: 'SOL', network: 'solana', recipient: 'network' }
          : undefined,
      };
    } catch (error: any) {
      return {
        success: false,
        data: { 
          type: 'balance' as const,
          status: 'simulated' as const,
          error: error.message,
          details: {},
        },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  },
};

/**
 * Parse user intent from prompt
 */
function parseIntent(prompt: string): {
  type: string;
  from?: string;
  to?: string;
  amount?: string;
  token?: string;
  address?: string;
  frequency?: string;
} {
  const lower = prompt.toLowerCase();
  
  // Extract amounts (e.g., "0.1 SOL", "100 USDC")
  const amountMatch = prompt.match(/([\d.]+)\s*(SOL|USDC|BONK|WIF|JUP)/i);
  const amount = amountMatch ? amountMatch[1] : undefined;
  const token = amountMatch ? amountMatch[2].toUpperCase() : 'SOL';
  
  // Extract addresses (Solana base58)
  const addressMatch = prompt.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
  const address = addressMatch ? addressMatch[0] : config.agentWallet.solanaAddress;
  
  // Determine intent type
  if (lower.includes('swap') || lower.includes('buy') || lower.includes('sell') || lower.includes('trade')) {
    // Parse swap direction
    const swapMatch = prompt.match(/(?:swap|buy|trade|sell)\s+(?:([\d.]+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i);
    if (swapMatch) {
      return {
        type: 'swap',
        amount: swapMatch[1] || amount || '0.1',
        from: swapMatch[2].toUpperCase(),
        to: swapMatch[3].toUpperCase(),
      };
    }
    // Default swap
    return { type: 'swap', from: 'SOL', to: 'USDC', amount: amount || '0.1' };
  }
  
  if (lower.includes('transfer') || lower.includes('send')) {
    return { type: 'transfer', to: address, amount, token };
  }
  
  if (lower.includes('balance') || lower.includes('wallet') || lower.includes('holdings')) {
    return { type: 'balance', address };
  }
  
  if (lower.includes('dca') || lower.includes('recurring') || lower.includes('auto-buy')) {
    const freqMatch = lower.match(/(daily|weekly|hourly|monthly)/);
    return { 
      type: 'dca', 
      token, 
      amount: amount || '0.1',
      frequency: freqMatch ? freqMatch[1] : 'daily',
    };
  }
  
  if (lower.includes('monitor') || lower.includes('watch') || lower.includes('track')) {
    return { type: 'monitor', address };
  }
  
  return { type: 'analyze', address };
}

/**
 * Execute a swap using bankr CLI (or simulation)
 */
async function executeSwap(from: string, to: string, amount: string): Promise<BankrAction> {
  console.log(`[bankr] Swap request: ${amount} ${from} -> ${to}`);
  
  // Try to execute via bankr CLI if available
  try {
    const { stdout } = await execAsync(
      `bankr swap --from ${from} --to ${to} --amount ${amount} --dry-run`,
      { timeout: 30000 }
    );
    
    // Parse output for tx signature
    const txMatch = stdout.match(/signature:\s*([1-9A-HJ-NP-Za-km-z]{64,88})/i);
    
    return {
      type: 'swap',
      status: 'simulated', // dry-run
      txSignature: txMatch ? txMatch[1] : undefined,
      details: {
        from,
        to,
        amount,
        estimatedOutput: (parseFloat(amount) * 0.98).toFixed(6), // Mock slippage
        rawOutput: stdout,
      },
    };
  } catch (error: any) {
    // Fallback to simulation
    console.log('[bankr] CLI unavailable, simulating swap');
    
    return {
      type: 'swap',
      status: 'simulated',
      details: {
        from,
        to,
        amount,
        estimatedOutput: (parseFloat(amount) * 125.5 * 0.98).toFixed(2), // Mock rate
        note: 'Simulated - bankr CLI not available',
        estimatedFee: '0.000005 SOL',
      },
    };
  }
}

/**
 * Execute a transfer
 */
async function executeTransfer(to: string, amount: string = '0.1', token: string = 'SOL'): Promise<BankrAction> {
  console.log(`[bankr] Transfer request: ${amount} ${token} to ${to}`);
  
  // Simulation only for safety
  return {
    type: 'transfer',
    status: 'simulated',
    details: {
      to,
      amount,
      token,
      estimatedFee: '0.000005 SOL',
      note: 'Transfer simulated for safety. Use bankr CLI directly for execution.',
    },
  };
}

/**
 * Check wallet balance
 */
async function checkBalance(address?: string): Promise<BankrAction> {
  const targetAddress = address || config.agentWallet.solanaAddress;
  
  console.log(`[bankr] Balance check for: ${targetAddress}`);
  
  try {
    // Use our Helius integration
    const solBalance = await solana.getBalance(targetAddress, 'mainnet');
    const tokenAccounts = await solana.getTokenAccounts(targetAddress, 'mainnet');
    
    // Parse token balances
    const tokens: Record<string, number> = {};
    for (const account of tokenAccounts) {
      const info = account.account?.data?.parsed?.info;
      if (info?.mint && info?.tokenAmount?.uiAmount) {
        tokens[info.mint] = info.tokenAmount.uiAmount;
      }
    }
    
    return {
      type: 'balance',
      status: 'executed',
      details: {
        address: targetAddress,
        sol: solBalance,
        tokens,
        network: 'mainnet',
      },
    };
  } catch (error: any) {
    // Fallback with mock data
    return {
      type: 'balance',
      status: 'simulated',
      details: {
        address: targetAddress,
        sol: 0.97,
        tokens: {},
        note: 'Balance simulated - RPC error',
        error: error.message,
      },
    };
  }
}

/**
 * Set up DCA (Dollar Cost Average) strategy
 */
async function setupDCA(token: string, amount: string, frequency: string): Promise<BankrAction> {
  console.log(`[bankr] DCA setup: ${amount} SOL -> ${token} ${frequency}`);
  
  return {
    type: 'dca',
    status: 'simulated',
    details: {
      token,
      amountPerPurchase: amount,
      frequency,
      estimatedOrders: frequency === 'daily' ? 30 : frequency === 'weekly' ? 4 : 1,
      note: 'DCA strategy simulated. Would require bankr CLI setup for live execution.',
    },
  };
}

/**
 * Monitor an address for activity
 */
async function monitorAddress(address: string): Promise<BankrAction> {
  console.log(`[bankr] Setting up monitor for: ${address}`);
  
  try {
    const recentTxs = await solana.getRecentTransactions(address, 5, 'mainnet');
    
    return {
      type: 'monitor',
      status: 'executed',
      details: {
        address,
        recentTransactions: recentTxs.length,
        lastActivity: recentTxs[0]?.blockTime 
          ? new Date(recentTxs[0].blockTime * 1000).toISOString()
          : 'Unknown',
        transactions: recentTxs.map(tx => ({
          signature: tx.signature,
          slot: tx.slot,
          status: tx.confirmationStatus,
        })),
      },
    };
  } catch (error: any) {
    return {
      type: 'monitor',
      status: 'simulated',
      details: {
        address,
        error: error.message,
        note: 'Monitor setup simulated',
      },
    };
  }
}

/**
 * Analyze a general request
 */
async function analyzeRequest(prompt: string): Promise<BankrAction> {
  return {
    type: 'balance',
    status: 'simulated',
    details: {
      request: prompt,
      analysis: 'Request analyzed but no specific action identified. Please specify: swap, transfer, balance, dca, or monitor.',
      examples: [
        'swap 0.1 SOL for USDC',
        'check wallet balance',
        'setup DCA 10 USDC daily into SOL',
        'monitor address <pubkey>',
      ],
    },
  };
}

export default bankr;
