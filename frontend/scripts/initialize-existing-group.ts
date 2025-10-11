/**
 * Helper script to manually initialize an existing group in the treasury contract
 *
 * This is useful for groups that were created in the factory but never initialized in the treasury.
 *
 * Usage: Call this function from the browser console after importing it
 */

import { showContractCall } from '@stacks/connect';
import { uintCV, stringAsciiCV, principalCV, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { stacksNetwork } from '../lib/stacks';

const DEPLOYER = 'STDCC1840NWS58QP44QMKC2BRX06VTRCZ7TGK95P';

export async function initializeExistingGroup(
  groupId: number,
  groupName: string,
  creatorAddress: string,
  creatorNickname: string
) {
  console.log('🔧 Manually initializing group in treasury...', {
    groupId,
    groupName,
    creatorAddress,
    creatorNickname
  });

  try {
    const txOptions = {
      contractAddress: DEPLOYER,
      contractName: 'group-treasury',
      functionName: 'initialize-group',
      functionArgs: [
        uintCV(groupId),
        stringAsciiCV(groupName),
        principalCV(creatorAddress),
        stringAsciiCV(creatorNickname)
      ],
      network: stacksNetwork,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      appDetails: {
        name: 'KindNest',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
      },
      onFinish: (data: any) => {
        console.log('✅ Treasury initialization tx submitted:', data.txId);
        console.log('🔗 View transaction:', `https://explorer.hiro.so/txid/${data.txId}?chain=testnet`);
      },
      onCancel: () => {
        console.log('❌ Transaction cancelled');
      },
    };

    await showContractCall(txOptions);
  } catch (err: any) {
    console.error('❌ Error initializing group:', err);
    throw err;
  }
}

// For group #4 specifically:
export async function initializeGroup4() {
  return initializeExistingGroup(
    4,
    'We group', // Replace with actual group name
    'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V', // Replace with actual creator address
    'Me' // Replace with actual creator nickname
  );
}
