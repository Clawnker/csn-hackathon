/**
 * x402 Protocol v2 Implementation
 * Uses official x402-solana package and x402.org testnet facilitator
 */

import { createX402Client } from 'x402-solana/dist/client';
import axios from 'axios';
import config from './config';
import { PaymentRecord } from './types';
import { logTransaction } from './x402';

// x402.org testnet facilitator (free, no API key needed)
export const X402_FACILITATOR = 'https://x402.org/facilitator';

// Solana devnet CAIP-2 identifier
export const SOLANA_DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1';

// Devnet USDC (test token)
const DEVNET_USDC_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'; // Common devnet USDC

/**
 * Create a 402 Payment Required response
 * This is what specialists return when payment is needed
 */
export function createPaymentRequiredResponse(
  payTo: string,
  amount: string,
  resource: string,
  description: string
) {
  return {
    x402Version: 2,
    accepts: [
      {
        scheme: 'exact',
        network: SOLANA_DEVNET,
        amount: amount,  // In atomic units (e.g., "1000" = 0.001 USDC)
        payTo: payTo,
        asset: DEVNET_USDC_MINT,
        resource: resource,
        description: description,
      }
    ],
    error: 'Payment Required',
    description: description,
  };
}

/**
 * Verify a payment signature via the facilitator
 */
export async function verifyPayment(
  paymentSignature: string,
  expectedPayTo: string,
  expectedAmount: string,
): Promise<{ valid: boolean; txHash?: string }> {
  try {
    const response = await axios.post(
      `${X402_FACILITATOR}/verify`,
      {
        paymentSignature,
        network: SOLANA_DEVNET,
        payTo: expectedPayTo,
        amount: expectedAmount,
      }
    );
    
    return {
      valid: response.data.valid,
      txHash: response.data.txHash,
    };
  } catch (error: any) {
    console.error('[x402] Verification failed:', error.message);
    return { valid: false };
  }
}

/**
 * Settle a payment via the facilitator
 * This actually executes the on-chain transfer
 */
export async function settlePayment(
  paymentSignature: string,
): Promise<{ success: boolean; txHash?: string }> {
  try {
    const response = await axios.post(
      `${X402_FACILITATOR}/settle`,
      {
        paymentSignature,
        network: SOLANA_DEVNET,
      }
    );
    
    console.log('[x402] Settlement response:', response.data);
    
    return {
      success: true,
      txHash: response.data.txHash || response.data.signature,
    };
  } catch (error: any) {
    console.error('[x402] Settlement failed:', error.response?.data || error.message);
    return { success: false };
  }
}

/**
 * Demo payment execution
 * For hackathon demo: simulates the x402 flow with real logging
 * In production: client would sign, server would verify+settle
 */
export async function executeDemoPayment(
  to: string,
  amountUsdc: number
): Promise<{ success: boolean; txSignature?: string }> {
  // For demo: we'll use Bankr to do the actual transfer
  // This simulates what happens after x402 settlement
  
  const bankrApiKey = process.env.BANKR_API_KEY;
  if (!bankrApiKey) {
    // Return simulated success for demo
    const fakeTx = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    console.log(`[x402] Demo payment (simulated): ${fakeTx}`);
    
    logTransaction({
      amount: amountUsdc.toString(),
      currency: 'USDC',
      network: 'solana',
      recipient: to,
      txHash: fakeTx,
      status: 'completed',
      timestamp: new Date(),
    });
    
    return { success: true, txSignature: fakeTx };
  }
  
  // Use Bankr for real transfer
  try {
    const submitRes = await axios.post(
      'https://api.bankr.bot/agent/prompt',
      { prompt: `Send ${amountUsdc} USDC to ${to} on Solana` },
      { headers: { 'X-API-Key': bankrApiKey } }
    );
    
    const jobId = submitRes.data.jobId;
    
    // Poll for result
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await axios.get(
        `https://api.bankr.bot/agent/job/${jobId}`,
        { headers: { 'X-API-Key': bankrApiKey } }
      );
      
      if (statusRes.data.status === 'completed') {
        // Extract tx from response
        const response = statusRes.data.response || '';
        const match = response.match(/[1-9A-HJ-NP-Za-km-z]{87,88}/);
        const txSignature = match ? match[0] : undefined;
        
        logTransaction({
          amount: amountUsdc.toString(),
          currency: 'USDC',
          network: 'solana',
          recipient: to,
          txHash: txSignature,
          status: 'completed',
          timestamp: new Date(),
        });

        return { 
          success: true, 
          txSignature
        };
      }
    }
    
    return { success: false };
  } catch (e) {
    console.error('[x402] Bankr payment failed:', e);
    return { success: false };
  }
}
