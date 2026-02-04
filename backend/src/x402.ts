/**
 * x402 Payment Integration
 * Handles payments through AgentWallet's x402 protocol
 */

import axios from 'axios';
import config from './config';
import { X402Request, X402Response, PaymentRecord } from './types';

const AGENTWALLET_API = config.agentWallet.apiUrl;
const USERNAME = config.agentWallet.username;
const TOKEN = config.agentWallet.token;

/**
 * Check wallet balances before making payments
 */
export async function getBalances(): Promise<{
  solana: { sol: number; usdc: number };
  evm: { eth: number; usdc: number };
}> {
  try {
    const response = await axios.get(
      `${AGENTWALLET_API}/wallets/${USERNAME}/balances`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    
    const data = response.data;
    
    // Parse Solana balances
    const solanaBalances = data.solana?.balances || [];
    const solBalance = solanaBalances.find((b: any) => b.asset === 'sol');
    const solUsdcBalance = solanaBalances.find((b: any) => b.asset === 'usdc');
    
    // Parse EVM balances (use base as primary)
    const evmBalances = data.evm?.balances || [];
    const ethBalance = evmBalances.find((b: any) => b.chain === 'base' && b.asset === 'eth');
    const evmUsdcBalance = evmBalances.find((b: any) => b.chain === 'base' && b.asset === 'usdc');
    
    return {
      solana: {
        sol: solBalance ? parseFloat(solBalance.rawValue) / Math.pow(10, solBalance.decimals) : 0,
        usdc: solUsdcBalance ? parseFloat(solUsdcBalance.rawValue) / Math.pow(10, solUsdcBalance.decimals) : 0,
      },
      evm: {
        eth: ethBalance ? parseFloat(ethBalance.rawValue) / Math.pow(10, ethBalance.decimals) : 0,
        usdc: evmUsdcBalance ? parseFloat(evmUsdcBalance.rawValue) / Math.pow(10, evmUsdcBalance.decimals) : 0,
      },
    };
  } catch (error: any) {
    console.error('Failed to get balances:', error.message);
    return {
      solana: { sol: 0, usdc: 0 },
      evm: { eth: 0, usdc: 0 },
    };
  }
}

/**
 * Execute an x402 payment-gated API call
 * This proxies through AgentWallet which handles payment negotiation
 */
export async function x402Fetch(request: X402Request): Promise<X402Response> {
  const startTime = Date.now();
  
  try {
    const payload = {
      url: request.url,
      method: request.method,
      body: request.body,
      headers: request.headers,
      dryRun: request.dryRun ?? false,
    };

    console.log(`[x402] Fetching ${request.method} ${request.url} (dryRun: ${payload.dryRun})`);

    const response = await axios.post(
      `${AGENTWALLET_API}/wallets/${USERNAME}/actions/x402/fetch`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const elapsed = Date.now() - startTime;
    console.log(`[x402] Completed in ${elapsed}ms`);

    return {
      success: true,
      data: response.data.response,
      payment: response.data.payment,
    };
  } catch (error: any) {
    console.error('[x402] Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Create a payment record for logging
 */
export function createPaymentRecord(
  amount: string,
  currency: string,
  network: 'solana' | 'base' | 'ethereum',
  recipient: string,
  txHash?: string
): PaymentRecord {
  return {
    amount,
    currency,
    network,
    recipient,
    txHash,
    status: txHash ? 'completed' : 'pending',
    timestamp: new Date(),
  };
}

/**
 * Log transaction for audit trail
 */
const transactionLog: PaymentRecord[] = [];

export function logTransaction(record: PaymentRecord): void {
  transactionLog.push(record);
  console.log(`[Payment] ${record.status}: ${record.amount} ${record.currency} on ${record.network}`);
  if (record.txHash) {
    console.log(`  TxHash: ${record.txHash}`);
  }
}

export function getTransactionLog(): PaymentRecord[] {
  return [...transactionLog];
}

export default {
  getBalances,
  x402Fetch,
  createPaymentRecord,
  logTransaction,
  getTransactionLog,
};
