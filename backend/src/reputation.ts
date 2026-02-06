/**
 * Reputation System - Global Agent Ratings via User/Agent Voting
 * 
 * Each task response can be upvoted or downvoted by any user or agent.
 * Votes are aggregated to calculate global success rates.
 * In production, this would be a centralized database accessible worldwide.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Vote {
  taskId: string;
  voterId: string;      // User or agent ID who voted
  voterType: 'human' | 'agent';
  vote: 'up' | 'down';
  timestamp: number;
}

interface SpecialistReputation {
  // Legacy counts (for backward compatibility)
  successCount: number;
  failureCount: number;
  
  // New voting-based system
  upvotes: number;
  downvotes: number;
  votes: Vote[];        // Individual vote records

  // On-chain sync data
  lastSyncTx?: string;
  lastSyncTimestamp?: number;
}

interface ReputationData {
  specialists: Record<string, SpecialistReputation>;
  // Track which voter has voted on which task (prevent double voting)
  voterTaskIndex: Record<string, string>;  // "voterId:taskId" -> "up"|"down"
}

const DATA_DIR = path.join(__dirname, '../data');
const REPUTATION_FILE = path.join(DATA_DIR, 'reputation.json');

// In-memory cache
let reputationData: ReputationData = {
  specialists: {},
  voterTaskIndex: {},
};

/**
 * Load reputation data from disk
 */
function loadReputation(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (fs.existsSync(REPUTATION_FILE)) {
      const data = fs.readFileSync(REPUTATION_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // Handle legacy format (flat specialist records)
      if (!parsed.specialists) {
        // Migrate from old format
        const specialists: Record<string, SpecialistReputation> = {};
        for (const [key, value] of Object.entries(parsed)) {
          const legacy = value as { successCount: number; failureCount: number };
          specialists[key] = {
            successCount: legacy.successCount || 0,
            failureCount: legacy.failureCount || 0,
            upvotes: legacy.successCount || 0,  // Migrate legacy successes as upvotes
            downvotes: legacy.failureCount || 0,
            votes: [],
          };
        }
        reputationData = { specialists, voterTaskIndex: {} };
        saveReputation();
        console.log(`[Reputation] Migrated legacy data for ${Object.keys(specialists).length} specialists`);
      } else {
        reputationData = parsed;
        console.log(`[Reputation] Loaded data for ${Object.keys(reputationData.specialists).length} specialists`);
      }
    } else {
      reputationData = { specialists: {}, voterTaskIndex: {} };
      saveReputation();
    }
  } catch (error: any) {
    console.error(`[Reputation] Failed to load reputation:`, error.message);
    reputationData = { specialists: {}, voterTaskIndex: {} };
  }
}

/**
 * Save reputation data to disk
 */
function saveReputation(): void {
  try {
    // Limit stored votes to last 100 per specialist for file size
    const dataToSave = { ...reputationData };
    for (const specialist of Object.values(dataToSave.specialists)) {
      if (specialist.votes.length > 100) {
        specialist.votes = specialist.votes.slice(-100);
      }
    }
    
    const data = JSON.stringify(dataToSave, null, 2);
    fs.writeFileSync(REPUTATION_FILE, data, 'utf8');
  } catch (error: any) {
    console.error(`[Reputation] Failed to save reputation:`, error.message);
  }
}

// Initial load
loadReputation();

/**
 * Get or initialize specialist record
 */
function getSpecialist(specialist: string): SpecialistReputation {
  if (!reputationData.specialists[specialist]) {
    reputationData.specialists[specialist] = {
      successCount: 0,
      failureCount: 0,
      upvotes: 0,
      downvotes: 0,
      votes: [],
    };
  }
  return reputationData.specialists[specialist];
}

/**
 * Record a successful task completion (legacy, still used internally)
 */
export function recordSuccess(specialist: string): void {
  const record = getSpecialist(specialist);
  record.successCount++;
  // Also count as an implicit upvote from the system
  record.upvotes++;
  saveReputation();
  console.log(`[Reputation] ${specialist} success recorded. New rate: ${getSuccessRate(specialist)}%`);
}

/**
 * Record a failed task completion (legacy)
 */
export function recordFailure(specialist: string): void {
  const record = getSpecialist(specialist);
  record.failureCount++;
  record.downvotes++;
  saveReputation();
  console.log(`[Reputation] ${specialist} failure recorded. New rate: ${getSuccessRate(specialist)}%`);
}

/**
 * Submit a vote on a task response
 * Returns: { success: boolean, message: string, newRate: number }
 */
export function submitVote(
  specialist: string,
  taskId: string,
  voterId: string,
  voterType: 'human' | 'agent',
  vote: 'up' | 'down'
): { success: boolean; message: string; newRate: number; upvotes: number; downvotes: number } {
  const voteKey = `${voterId}:${taskId}`;
  const existingVote = reputationData.voterTaskIndex[voteKey];
  
  const record = getSpecialist(specialist);
  
  // Check if already voted
  if (existingVote) {
    if (existingVote === vote) {
      return {
        success: false,
        message: `Already ${vote}voted this response`,
        newRate: getSuccessRate(specialist),
        upvotes: record.upvotes,
        downvotes: record.downvotes,
      };
    }
    
    // Changing vote - undo previous vote first
    if (existingVote === 'up') {
      record.upvotes = Math.max(0, record.upvotes - 1);
    } else {
      record.downvotes = Math.max(0, record.downvotes - 1);
    }
  }
  
  // Apply new vote
  if (vote === 'up') {
    record.upvotes++;
  } else {
    record.downvotes++;
  }
  
  // Record the vote
  const voteRecord: Vote = {
    taskId,
    voterId,
    voterType,
    vote,
    timestamp: Date.now(),
  };
  record.votes.push(voteRecord);
  reputationData.voterTaskIndex[voteKey] = vote;
  
  saveReputation();
  
  const action = existingVote ? 'changed to' : 'recorded';
  console.log(`[Reputation] Vote ${action} ${vote} for ${specialist} by ${voterType} ${voterId}. New rate: ${getSuccessRate(specialist)}%`);
  
  return {
    success: true,
    message: existingVote ? `Vote changed to ${vote}vote` : `${vote === 'up' ? 'Upvote' : 'Downvote'} recorded`,
    newRate: getSuccessRate(specialist),
    upvotes: record.upvotes,
    downvotes: record.downvotes,
  };
}

/**
 * Update the on-chain sync status for a specialist
 */
export function updateSyncStatus(specialist: string, signature: string): void {
  const record = getSpecialist(specialist);
  record.lastSyncTx = signature;
  record.lastSyncTimestamp = Date.now();
  saveReputation();
  console.log(`[Reputation] Sync status updated for ${specialist}: ${signature}`);
}

/**
 * Get the vote for a specific task by a voter (if any)
 */
export function getVote(taskId: string, voterId: string): 'up' | 'down' | null {
  const voteKey = `${voterId}:${taskId}`;
  return (reputationData.voterTaskIndex[voteKey] as 'up' | 'down') || null;
}

/**
 * Get the success rate for a specialist as a percentage
 * Based on upvotes vs total votes
 */
export function getSuccessRate(specialist: string): number {
  const record = reputationData.specialists[specialist];
  if (!record) return 100; // Default for new specialists
  
  const total = record.upvotes + record.downvotes;
  if (total === 0) return 100;
  
  return Math.round((record.upvotes / total) * 100);
}

/**
 * Get detailed reputation stats for a specialist
 */
export function getReputationStats(specialist: string): {
  successRate: number;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  recentVotes: Vote[];
  lastSyncTx?: string;
  lastSyncTimestamp?: number;
} {
  const record = reputationData.specialists[specialist];
  if (!record) {
    return {
      successRate: 100,
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      recentVotes: [],
    };
  }
  
  return {
    successRate: getSuccessRate(specialist),
    upvotes: record.upvotes,
    downvotes: record.downvotes,
    totalVotes: record.upvotes + record.downvotes,
    recentVotes: record.votes.slice(-10),
    lastSyncTx: record.lastSyncTx,
    lastSyncTimestamp: record.lastSyncTimestamp,
  };
}

/**
 * Get all reputation data (for admin/display)
 */
export function getAllReputation(): Record<string, { successRate: number; upvotes: number; downvotes: number }> {
  const result: Record<string, { successRate: number; upvotes: number; downvotes: number }> = {};
  
  for (const [specialist, record] of Object.entries(reputationData.specialists)) {
    result[specialist] = {
      successRate: getSuccessRate(specialist),
      upvotes: record.upvotes,
      downvotes: record.downvotes,
    };
  }
  
  return result;
}
