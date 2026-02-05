/**
 * Specialists Index
 * Exports all available specialists
 */

import magos from './magos';
import aura from './aura';
import bankr from './bankr';
import scribe from './scribe';
import seeker from './seeker';

export { magos, aura, bankr, scribe, seeker };

export const specialists = {
  magos,
  aura,
  bankr,
  scribe,
  seeker,
};

export const specialistList = [
  {
    id: 'magos',
    name: 'Magos',
    description: 'Predictive Oracle',
    capabilities: ['predictions', 'risk-analysis', 'price-targets', 'technical-analysis'],
    paymentRequired: true,
  },
  {
    id: 'aura',
    name: 'Aura',
    description: 'Social Sentinel',
    capabilities: ['sentiment', 'trending', 'alpha-detection', 'influencer-tracking'],
    paymentRequired: true,
  },
  {
    id: 'bankr',
    name: 'Bankr',
    description: 'Execution Engine',
    capabilities: ['swap', 'transfer', 'balance', 'dca', 'monitoring'],
    paymentRequired: true,
  },
  {
    id: 'scribe',
    name: 'Scribe',
    description: 'Documentation Assistant',
    capabilities: ['summarization', 'documentation', 'Q&A'],
    paymentRequired: true,
  },
  {
    id: 'seeker',
    name: 'Seeker',
    description: 'Web Research Specialist',
    capabilities: ['search', 'research', 'lookup'],
    paymentRequired: true,
  },
];

export default specialists;
