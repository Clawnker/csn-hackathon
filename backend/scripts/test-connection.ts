/**
 * Test Connection Script
 * Verifies Helius RPC and AgentWallet connectivity
 */

import config from '../src/config';
import solana from '../src/solana';
import { getBalances } from '../src/x402';

async function main() {
  console.log('=== Hivemind Connection Test ===\n');

  // Test Helius Devnet
  console.log('1. Testing Helius Devnet...');
  const devnetOk = await solana.testConnection('devnet');
  console.log(`   Result: ${devnetOk ? '✓ Connected' : '✗ Failed'}\n`);

  // Test Helius Mainnet
  console.log('2. Testing Helius Mainnet...');
  const mainnetOk = await solana.testConnection('mainnet');
  console.log(`   Result: ${mainnetOk ? '✓ Connected' : '✗ Failed'}\n`);

  // Test AgentWallet Balance
  console.log('3. Testing AgentWallet...');
  const balances = await getBalances();
  console.log(`   Result: ${balances.solana.sol !== undefined ? '✓ Connected' : '✗ Failed'}`);
  console.log(`   SOL Balance: ${balances.solana.sol}`);
  console.log(`   USDC Balance: ${balances.solana.usdc}\n`);

  // Test Solana balance check
  console.log('4. Testing Solana Balance API...');
  const testAddress = config.agentWallet.solanaAddress;
  if (testAddress) {
    const balance = await solana.getBalance(testAddress, 'mainnet');
    console.log(`   Address: ${testAddress}`);
    console.log(`   Balance: ${balance} SOL\n`);
  } else {
    console.log('   No wallet address configured\n');
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`Helius Devnet:  ${devnetOk ? '✓' : '✗'}`);
  console.log(`Helius Mainnet: ${mainnetOk ? '✓' : '✗'}`);
  console.log(`AgentWallet:    ${balances.solana.sol !== undefined ? '✓' : '✗'}`);
  
  const allOk = devnetOk && mainnetOk && balances.solana.sol !== undefined;
  console.log(`\nOverall: ${allOk ? '✓ All systems operational' : '⚠ Some services unavailable'}`);
  
  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
