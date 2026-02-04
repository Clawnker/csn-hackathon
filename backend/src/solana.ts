/**
 * Solana Integration
 * Handles Solana RPC connections, transaction monitoring via Helius
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import config from './config';

// Use devnet for testing, mainnet for production
const DEVNET_RPC = config.helius.devnet;
const MAINNET_RPC = config.helius.mainnet;

let devnetConnection: Connection | null = null;
let mainnetConnection: Connection | null = null;

/**
 * Get Solana connection (lazy initialization)
 */
export function getConnection(network: 'devnet' | 'mainnet' = 'devnet'): Connection {
  if (network === 'devnet') {
    if (!devnetConnection) {
      devnetConnection = new Connection(DEVNET_RPC, 'confirmed');
    }
    return devnetConnection;
  } else {
    if (!mainnetConnection) {
      mainnetConnection = new Connection(MAINNET_RPC, 'confirmed');
    }
    return mainnetConnection;
  }
}

/**
 * Test connection to Helius RPC
 */
export async function testConnection(network: 'devnet' | 'mainnet' = 'devnet'): Promise<boolean> {
  try {
    const connection = getConnection(network);
    const slot = await connection.getSlot();
    console.log(`[Helius] Connected to ${network}, current slot: ${slot}`);
    return true;
  } catch (error: any) {
    console.error(`[Helius] Connection failed for ${network}:`, error.message);
    return false;
  }
}

/**
 * Get SOL balance for an address
 */
export async function getBalance(
  address: string,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<number> {
  try {
    const connection = getConnection(network);
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error: any) {
    console.error('[Helius] Failed to get balance:', error.message);
    return 0;
  }
}

/**
 * Get recent transactions for an address
 */
export async function getRecentTransactions(
  address: string,
  limit: number = 10,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<any[]> {
  try {
    const connection = getConnection(network);
    const pubkey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
    return signatures;
  } catch (error: any) {
    console.error('[Helius] Failed to get transactions:', error.message);
    return [];
  }
}

/**
 * Monitor address for new transactions (webhook-style polling)
 * Returns a function to stop monitoring
 */
export function monitorAddress(
  address: string,
  callback: (tx: any) => void,
  intervalMs: number = 5000,
  network: 'devnet' | 'mainnet' = 'devnet'
): () => void {
  let lastSeen: string | null = null;
  
  const check = async () => {
    try {
      const txs = await getRecentTransactions(address, 5, network);
      if (txs.length > 0) {
        const latest = txs[0].signature;
        if (lastSeen && latest !== lastSeen) {
          // New transaction(s) detected
          for (const tx of txs) {
            if (tx.signature === lastSeen) break;
            callback(tx);
          }
        }
        lastSeen = latest;
      }
    } catch (error: any) {
      console.error('[Monitor] Error:', error.message);
    }
  };

  // Initial check
  check();
  
  // Set up polling
  const interval = setInterval(check, intervalMs);
  
  // Return stop function
  return () => {
    clearInterval(interval);
    console.log(`[Monitor] Stopped monitoring ${address}`);
  };
}

/**
 * Get token accounts for an address using Helius enhanced API
 */
export async function getTokenAccounts(
  address: string,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<any[]> {
  try {
    const rpcUrl = network === 'devnet' ? DEVNET_RPC : MAINNET_RPC;
    
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'token-accounts',
      method: 'getTokenAccountsByOwner',
      params: [
        address,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' },
      ],
    });

    return response.data.result?.value || [];
  } catch (error: any) {
    console.error('[Helius] Failed to get token accounts:', error.message);
    return [];
  }
}

/**
 * Get transaction details using Helius enhanced transaction API
 */
export async function getEnhancedTransaction(
  signature: string,
  network: 'devnet' | 'mainnet' = 'devnet'
): Promise<any> {
  try {
    const apiKey = config.helius.apiKey;
    const baseUrl = network === 'devnet' 
      ? 'https://api-devnet.helius.xyz'
      : 'https://api.helius.xyz';
    
    const response = await axios.get(
      `${baseUrl}/v0/transactions/?api-key=${apiKey}&transactions=${signature}`
    );

    return response.data[0] || null;
  } catch (error: any) {
    console.error('[Helius] Failed to get enhanced transaction:', error.message);
    return null;
  }
}

export default {
  getConnection,
  testConnection,
  getBalance,
  getRecentTransactions,
  monitorAddress,
  getTokenAccounts,
  getEnhancedTransaction,
};
