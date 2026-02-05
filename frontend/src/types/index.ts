export interface Payment {
  id: string;
  amount: number;
  token: string;
  from: string;
  to: string;
  txSignature?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface QueryHistoryItem {
  id: string;
  prompt: string;
  specialist: string;
  cost: number;
  status: 'success' | 'failed';
  timestamp: Date;
  result?: string;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  payload?: any;
  content?: string;
  timestamp: string;
}

export type SpecialistType = 
  | 'bankr' 
  | 'magos' 
  | 'aura' 
  | 'scribe' 
  | 'seeker' 
  | 'general' 
  | 'dispatcher' 
  | 'alphahunter' 
  | 'riskbot' 
  | 'newsdigest' 
  | 'whalespy';

export interface SpecialistPricing {
  fee: string;
  token: string;
  description?: string;
}

export type TaskStatus = 
  | 'idle'
  | 'routing'
  | 'awaiting_payment'
  | 'processing'
  | 'executing'
  | 'planning'
  | 'completed'
  | 'failed';

export interface WalletBalance {
  address: string;
  SOL: number;
  USDC: number;
}
