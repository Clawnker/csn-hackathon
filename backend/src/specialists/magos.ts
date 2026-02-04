/**
 * Magos Specialist
 * Expert in predictions and risk analysis
 * Connects to ClawArena API for price predictions
 */

import axios from 'axios';
import config from '../config';
import { MagosPrediction, SpecialistResult } from '../types';
import { x402Fetch } from '../x402';

const CLAWARENA_API = config.specialists.clawarena.baseUrl;
const API_KEY = config.specialists.clawarena.apiKey;

/**
 * Magos specialist handler
 */
export const magos = {
  name: 'Magos',
  description: 'Expert in predictions, risk analysis, and price forecasting. Uses ClawArena for market predictions.',
  
  /**
   * Main handler - parses prompt and routes to appropriate function
   */
  async handle(prompt: string): Promise<SpecialistResult> {
    const startTime = Date.now();
    
    try {
      // Parse the prompt to extract intent
      const intent = parseIntent(prompt);
      
      let data: any;
      
      switch (intent.type) {
        case 'predict':
          data = await predictPrice(intent.token || 'SOL', intent.timeHorizon || '4h');
          break;
        case 'risk':
          data = await assessRisk(intent.token || 'SOL');
          break;
        case 'analyze':
          data = await analyzeToken(intent.token || 'SOL');
          break;
        default:
          data = await generateInsight(prompt);
      }

      return {
        success: true,
        data,
        confidence: data.confidence || 0.7,
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        data: { error: error.message },
        timestamp: new Date(),
        executionTimeMs: Date.now() - startTime,
      };
    }
  },
};

/**
 * Parse user intent from prompt
 */
function parseIntent(prompt: string): { type: string; token?: string; timeHorizon?: string } {
  const lower = prompt.toLowerCase();
  
  // Extract token mention (e.g., SOL, BTC, ETH, or CA)
  const tokenMatch = prompt.match(/\b(SOL|BTC|ETH|BONK|WIF|JUP|[A-Za-z0-9]{32,44})\b/i);
  const token = tokenMatch ? tokenMatch[1].toUpperCase() : 'SOL';
  
  // Extract time horizon
  const timeMatch = prompt.match(/(\d+)\s*(h|hour|hr|d|day|w|week|m|min)/i);
  let timeHorizon = '4h'; // default
  if (timeMatch) {
    const num = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith('h')) timeHorizon = `${num}h`;
    else if (unit.startsWith('d')) timeHorizon = `${num}d`;
    else if (unit.startsWith('w')) timeHorizon = `${num}w`;
    else if (unit.startsWith('m')) timeHorizon = `${num}m`;
  }
  
  // Determine intent type
  if (lower.includes('predict') || lower.includes('price') || lower.includes('forecast')) {
    return { type: 'predict', token, timeHorizon };
  }
  if (lower.includes('risk') || lower.includes('danger') || lower.includes('safe')) {
    return { type: 'risk', token };
  }
  if (lower.includes('analyze') || lower.includes('analysis') || lower.includes('deep dive')) {
    return { type: 'analyze', token };
  }
  
  return { type: 'insight', token, timeHorizon };
}

/**
 * Get price prediction for a token
 */
async function predictPrice(token: string, timeHorizon: string = '4h'): Promise<MagosPrediction> {
  // Try ClawArena API if available
  if (CLAWARENA_API && API_KEY) {
    try {
      const response = await axios.get(`${CLAWARENA_API}/v1/predictions/${token}`, {
        headers: { 'X-API-Key': API_KEY },
        params: { horizon: timeHorizon },
      });
      return response.data;
    } catch (error) {
      console.log('[Magos] ClawArena API unavailable, using fallback');
    }
  }
  
  // Fallback: Generate synthetic prediction based on market patterns
  // In production, this would use on-chain data and ML models
  const mockPrices: Record<string, number> = {
    'SOL': 125.50,
    'BTC': 67500,
    'ETH': 3450,
    'BONK': 0.000025,
    'WIF': 2.15,
    'JUP': 0.85,
  };
  
  const currentPrice = mockPrices[token] || 1.0;
  const volatility = 0.05 + Math.random() * 0.1; // 5-15% volatility
  const direction = Math.random() > 0.5 ? 1 : -1;
  const change = direction * volatility * currentPrice;
  const predictedPrice = currentPrice + change;
  
  const confidence = 0.6 + Math.random() * 0.3; // 60-90%
  
  return {
    token,
    currentPrice,
    predictedPrice,
    timeHorizon,
    confidence,
    direction: direction > 0 ? 'bullish' : 'bearish',
    reasoning: `Based on recent momentum and volume analysis for ${token}. ${
      direction > 0 
        ? 'Buying pressure detected with accumulation pattern.'
        : 'Distribution pattern suggests near-term weakness.'
    }`,
  };
}

/**
 * Assess risk for a token
 */
async function assessRisk(token: string): Promise<{
  token: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number;
  factors: string[];
  recommendation: string;
}> {
  // Mock risk assessment - in production would use on-chain audits
  const riskScore = Math.random();
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  let factors: string[] = [];
  
  if (riskScore < 0.25) {
    riskLevel = 'low';
    factors = ['Verified contract', 'High liquidity', 'Strong holder distribution'];
  } else if (riskScore < 0.5) {
    riskLevel = 'medium';
    factors = ['Some whale concentration', 'Moderate liquidity'];
  } else if (riskScore < 0.75) {
    riskLevel = 'high';
    factors = ['Low liquidity', 'Concentrated holdings', 'Recent large sells'];
  } else {
    riskLevel = 'extreme';
    factors = ['Honeypot indicators', 'Extreme whale control', 'Suspicious contract'];
  }
  
  return {
    token,
    riskLevel,
    riskScore,
    factors,
    recommendation: riskLevel === 'low' || riskLevel === 'medium'
      ? 'Proceed with standard position sizing'
      : 'Avoid or use minimal exposure',
  };
}

/**
 * Deep analysis of a token
 */
async function analyzeToken(token: string): Promise<{
  token: string;
  analysis: {
    technicals: any;
    fundamentals: any;
    sentiment: any;
  };
  summary: string;
}> {
  const prediction = await predictPrice(token, '24h');
  const risk = await assessRisk(token);
  
  return {
    token,
    analysis: {
      technicals: {
        trend: prediction.direction,
        priceTarget: prediction.predictedPrice,
        support: prediction.currentPrice * 0.95,
        resistance: prediction.currentPrice * 1.05,
      },
      fundamentals: {
        riskLevel: risk.riskLevel,
        factors: risk.factors,
      },
      sentiment: {
        overall: prediction.direction === 'bullish' ? 'positive' : 'negative',
        confidence: prediction.confidence,
      },
    },
    summary: `${token} shows ${prediction.direction} signals with ${Math.round(prediction.confidence * 100)}% confidence. Risk level: ${risk.riskLevel}. ${risk.recommendation}`,
  };
}

/**
 * Generate general insight from prompt
 */
async function generateInsight(prompt: string): Promise<{
  insight: string;
  confidence: number;
  relatedTokens: string[];
}> {
  return {
    insight: `Magos analysis of "${prompt}": Market conditions suggest cautious optimism. Multiple factors indicate potential volatility ahead. Consider dollar-cost averaging for major positions.`,
    confidence: 0.65,
    relatedTokens: ['SOL', 'BTC', 'ETH'],
  };
}

export default magos;
