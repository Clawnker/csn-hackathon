/**
 * bankr Specialist - Real Integration
 * Uses bankr API for actual Solana trading
 */

import axios from 'axios';
import { BankrAction, SpecialistResult } from '../types';

// Load bankr config
const BANKR_CONFIG = (() => {
  try {
    const fs = require('fs');
    const configPath = process.env.HOME + '/.clawdbot/skills/bankr/config.json';
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return {
      apiKey: process.env.BANKR_API_KEY || '',
      apiUrl: 'https://api.bankr.bot'
    };
  }
})();

const BANKR_API = BANKR_CONFIG.apiUrl;
const BANKR_KEY = BANKR_CONFIG.apiKey;

/**
 * Submit a job to bankr API
 */
async function submitJob(prompt: string): Promise<{ jobId: string }> {
  const response = await axios.post(
    `${BANKR_API}/v1/agent/jobs`,
    { prompt },
    {
      headers: {
        'Authorization': `Bearer ${BANKR_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

/**
 * Poll for job status
 */
async function pollJob(jobId: string, maxAttempts = 30, intervalMs = 1000): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await axios.get(
      `${BANKR_API}/v1/agent/jobs/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${BANKR_KEY}`,
        },
      }
    );
    
    const job = response.data;
    console.log(`[bankr] Job ${jobId} status: ${job.status}`);
    
    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error('Job timed out');
}

/**
 * bankr specialist handler
 */
export const bankr = {
  name: 'bankr',
  description: 'Expert in Solana/EVM trading via bankr API. Executes swaps, transfers, and DeFi operations.',
  
  async handle(prompt: string): Promise<SpecialistResult> {
    const startTime = Date.now();
    
    if (!BANKR_KEY) {
      return {
        success: false,
        data: {
          type: 'swap' as const,
          status: 'simulated' as const,
          details: { error: 'Bankr API key not configured' },
        },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
    
    try {
      console.log(`[bankr] Submitting to bankr API: "${prompt}"`);
      
      // Submit the job
      const { jobId } = await submitJob(prompt);
      console.log(`[bankr] Job submitted: ${jobId}`);
      
      // Poll for completion
      const result = await pollJob(jobId);
      
      // Extract transaction info if available
      const txSignature = extractTxSignature(result);
      const actionType = detectActionType(prompt);
      
      return {
        success: result.status === 'completed',
        data: {
          type: actionType,
          status: result.status === 'completed' ? 'confirmed' : 'failed',
          txSignature,
          details: {
            jobId,
            response: result.response || result.result,
            transactions: result.transactions || [],
          },
        } as BankrAction,
        confidence: 0.95,
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
        cost: txSignature ? {
          amount: '0.000005',
          currency: 'SOL',
          network: 'solana',
          recipient: 'network',
        } : undefined,
      };
    } catch (error: any) {
      console.error('[bankr] API error:', error.message);
      
      return {
        success: false,
        data: {
          type: 'swap' as const,
          status: 'failed' as const,
          details: { 
            error: error.message,
            note: 'bankr API call failed',
          },
        },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  },
};

/**
 * Extract transaction signature from bankr response
 */
function extractTxSignature(result: any): string | undefined {
  // Check various places where tx might be
  if (result.txSignature) return result.txSignature;
  if (result.transactions?.[0]?.signature) return result.transactions[0].signature;
  if (result.response?.match?.(/[1-9A-HJ-NP-Za-km-z]{64,88}/)) {
    return result.response.match(/[1-9A-HJ-NP-Za-km-z]{64,88}/)[0];
  }
  return undefined;
}

/**
 * Detect action type from prompt
 */
function detectActionType(prompt: string): 'swap' | 'transfer' | 'balance' | 'dca' | 'monitor' {
  const lower = prompt.toLowerCase();
  if (lower.includes('swap') || lower.includes('buy') || lower.includes('sell') || lower.includes('trade')) {
    return 'swap';
  }
  if (lower.includes('transfer') || lower.includes('send')) {
    return 'transfer';
  }
  if (lower.includes('balance') || lower.includes('wallet')) {
    return 'balance';
  }
  if (lower.includes('dca')) {
    return 'dca';
  }
  return 'swap'; // default
}

export default bankr;
