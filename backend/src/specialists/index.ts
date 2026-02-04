/**
 * Specialists Index
 * Exports all available specialists
 */

import magos from './magos';
import aura from './aura';
import bankr from './bankr';

export { magos, aura, bankr };

export const specialists = {
  magos,
  aura,
  bankr,
};

export const specialistList = [
  {
    id: 'magos',
    name: magos.name,
    description: magos.description,
    capabilities: ['predictions', 'risk-analysis', 'price-targets', 'technical-analysis'],
    paymentRequired: true,
  },
  {
    id: 'aura',
    name: aura.name,
    description: aura.description,
    capabilities: ['sentiment', 'trending', 'alpha-detection', 'influencer-tracking'],
    paymentRequired: false,
  },
  {
    id: 'bankr',
    name: bankr.name,
    description: bankr.description,
    capabilities: ['swap', 'transfer', 'balance', 'dca', 'monitoring'],
    paymentRequired: false, // Network fees only
  },
];

export default specialists;
