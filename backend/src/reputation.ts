import * as fs from 'fs';
import * as path from 'path';
import { SpecialistType } from './types';

interface SpecialistReputation {
  successCount: number;
  failureCount: number;
}

type ReputationData = Record<string, SpecialistReputation>;

const DATA_DIR = path.join(__dirname, '../data');
const REPUTATION_FILE = path.join(DATA_DIR, 'reputation.json');

// In-memory cache
let reputationData: ReputationData = {};

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
      reputationData = JSON.parse(data);
      console.log(`[Reputation] Loaded data for ${Object.keys(reputationData).length} specialists`);
    } else {
      reputationData = {};
      saveReputation();
    }
  } catch (error: any) {
    console.error(`[Reputation] Failed to load reputation:`, error.message);
    reputationData = {};
  }
}

/**
 * Save reputation data to disk
 */
function saveReputation(): void {
  try {
    const data = JSON.stringify(reputationData, null, 2);
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
  if (!reputationData[specialist]) {
    reputationData[specialist] = { successCount: 0, failureCount: 0 };
  }
  return reputationData[specialist];
}

/**
 * Record a successful task completion
 */
export function recordSuccess(specialist: string): void {
  const record = getSpecialist(specialist);
  record.successCount++;
  saveReputation();
  console.log(`[Reputation] ${specialist} success recorded. New rate: ${getSuccessRate(specialist)}%`);
}

/**
 * Record a failed task completion
 */
export function recordFailure(specialist: string): void {
  const record = getSpecialist(specialist);
  record.failureCount++;
  saveReputation();
  console.log(`[Reputation] ${specialist} failure recorded. New rate: ${getSuccessRate(specialist)}%`);
}

/**
 * Get the success rate for a specialist as a percentage
 */
export function getSuccessRate(specialist: string): number {
  const record = reputationData[specialist];
  if (!record) return 100; // Default for new specialists
  
  const total = record.successCount + record.failureCount;
  if (total === 0) return 100;
  
  return Math.round((record.successCount / total) * 100);
}

/**
 * Get all reputation data
 */
export function getAllReputation(): ReputationData {
  return { ...reputationData };
}
