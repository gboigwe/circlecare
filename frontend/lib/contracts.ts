'use client';

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createAssetInfo,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  uintCV,
  stringAsciiCV,
  listCV,
  principalCV,
  noneCV,
  someCV,
  callReadOnlyFunction,
  cvToValue,
  ClarityValue
} from '@stacks/transactions';

import { stacksNetwork } from './stacks';

// Contract addresses (deployed on Stacks testnet)
// Clarity 4 deployment with stacks-block-time
export const CONTRACTS = {
  EXPENSE_FACTORY: 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.expense-factory',
  GROUP_TREASURY: 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.group-treasury'
} as const;

export const NETWORK_INFO = {
  chainId: 'testnet',
  name: 'Stacks Testnet',
  nodeUrl: 'https://stacks-node-api.testnet.stacks.co',
} as const;

import { getUserStxAddress as getStxAddress } from './stacks';

// Helper to get user's STX address
const getUserStxAddress = () => {
  return getStxAddress();
};

// Helper function to deeply unwrap Clarity values
// Clarity types (principals, strings, uints, etc.) are wrapped in { value: ... } objects
// BigInts need to be converted to numbers for display
const deepUnwrapClarityValue = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt - convert to number
  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepUnwrapClarityValue(item));
  }

  // Handle objects
  if (typeof obj === 'object') {
    // If it has a single 'value' property, unwrap it recursively
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === 'value') {
      return deepUnwrapClarityValue(obj.value);
    }

    // If it has a 'type' property, it might be a Clarity CV object
    if ('type' in obj) {
      // For Clarity value objects, unwrap the value if present
      if ('value' in obj) {
        return deepUnwrapClarityValue(obj.value);
      }
    }

    // Otherwise, recursively unwrap all properties
    const unwrapped: any = {};
    for (const [key, val] of Object.entries(obj)) {
      unwrapped[key] = deepUnwrapClarityValue(val);
    }
    return unwrapped;
  }

  // Return primitives as-is (string, number, boolean)
  return obj;
};

// Create a new support group
export const createGroup = async (
  senderKey: string,
  groupName: string,
  creatorNickname: string,
  feeAmount: number = 0
): Promise<string> => {
  const postConditions = feeAmount > 0 ? [
    makeStandardSTXPostCondition(
      getUserStxAddress()!,
      FungibleConditionCode.LessEqual,
      feeAmount
    )
  ] : [];

  const txOptions = {
    contractAddress: CONTRACTS.EXPENSE_FACTORY.split('.')[0],
    contractName: CONTRACTS.EXPENSE_FACTORY.split('.')[1],
    functionName: 'create-group',
    functionArgs: [
      stringAsciiCV(groupName),
      stringAsciiCV(creatorNickname)
    ],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    fee: 1000 // STX fee in microSTX
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Add member to group (via GroupTreasury contract)
export const addMemberToGroup = async (
  senderKey: string,
  groupId: number,
  memberAddress: string,
  nickname: string
): Promise<string> => {
  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'add-member',
    functionArgs: [
      uintCV(groupId),
      principalCV(memberAddress),
      stringAsciiCV(nickname)
    ],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Initialize group in treasury contract
export const initializeGroup = async (
  senderKey: string,
  groupId: number,
  groupName: string,
  creator: string,
  creatorNickname: string
): Promise<string> => {
  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'initialize-group',
    functionArgs: [
      uintCV(groupId),
      stringAsciiCV(groupName),
      principalCV(creator),
      stringAsciiCV(creatorNickname)
    ],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Add expense (STX)
export const addExpense = async (
  senderKey: string,
  groupId: number,
  description: string,
  amount: number,
  participants: string[]
): Promise<string> => {
  const participantCVs = participants.map(addr => principalCV(addr));

  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'add-expense',
    functionArgs: [
      uintCV(groupId),
      stringAsciiCV(description),
      uintCV(amount),
      listCV(participantCVs)
    ],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Settle debt in STX
export const settleDebtSTX = async (
  senderKey: string,
  groupId: number,
  creditorAddress: string,
  amount: number
): Promise<string> => {
  const postConditions = [
    makeStandardSTXPostCondition(
      getUserStxAddress()!,
      FungibleConditionCode.LessEqual,
      amount
    )
  ];

  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'settle-debt-stx',
    functionArgs: [
      uintCV(groupId),
      principalCV(creditorAddress),
      uintCV(amount)
    ],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Pause group (close nest)
export const pauseGroup = async (
  senderKey: string,
  groupId: number
): Promise<string> => {
  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'pause-group',
    functionArgs: [uintCV(groupId)],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Unpause group (reopen nest)
export const unpauseGroup = async (
  senderKey: string,
  groupId: number
): Promise<string> => {
  const txOptions = {
    contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
    contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
    functionName: 'unpause-group',
    functionArgs: [uintCV(groupId)],
    senderKey,
    network: stacksNetwork,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    fee: 1000
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result.txid || result.toString();
};

// Read-only function helpers

// Get group information from factory
export const getGroupInfo = async (groupId: number): Promise<any> => {
  try {
    // Validate groupId is a valid number
    if (groupId === undefined || groupId === null || isNaN(groupId)) {
      console.error('❌ Invalid groupId for getGroupInfo:', groupId);
      return null;
    }

    // Ensure it's an integer
    const validGroupId = Math.floor(Number(groupId));

    console.log('📋 Fetching group info for groupId:', validGroupId);
    console.log('📋 Contract:', CONTRACTS.EXPENSE_FACTORY);

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.EXPENSE_FACTORY.split('.')[0],
      contractName: CONTRACTS.EXPENSE_FACTORY.split('.')[1],
      functionName: 'get-group-info',
      functionArgs: [uintCV(validGroupId)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    console.log('📦 Raw Clarity result (before cvToValue):', result);
    console.log('📦 Result type:', result.type);

    const value = cvToValue(result);
    console.log('✅ After cvToValue:', JSON.stringify(value, (key, val) =>
      typeof val === 'bigint' ? val.toString() + 'n' : val
    , 2));

    // Deep unwrap all Clarity values
    const processed = deepUnwrapClarityValue(value);
    console.log('✅ After deepUnwrap:', JSON.stringify(processed, null, 2));
    console.log('✅ Name extracted:', processed?.name);
    console.log('✅ Creator extracted:', processed?.creator);

    return processed;
  } catch (error) {
    console.error('❌ Error getting group info for groupId', groupId, ':', error);
    return null;
  }
};

// Get user's groups - queries BOTH factory (creator) and treasury (member)
export const getUserGroups = async (userAddress: string): Promise<number[]> => {
  try {
    console.log('👥 Fetching groups for user from both contracts:', userAddress);

    const groupsSet = new Set<number>();

    // 1. Get groups from factory (where user is creator or added via factory)
    try {
      const factoryResult = await callReadOnlyFunction({
        contractAddress: CONTRACTS.EXPENSE_FACTORY.split('.')[0],
        contractName: CONTRACTS.EXPENSE_FACTORY.split('.')[1],
        functionName: 'get-user-groups',
        functionArgs: [principalCV(userAddress)],
        network: stacksNetwork,
        senderAddress: userAddress
      });

      const rawValue = cvToValue(factoryResult);

      if (Array.isArray(rawValue)) {
        rawValue.forEach(id => {
          const numId = typeof id === 'bigint' ? Number(id) : Number(id);
          if (!isNaN(numId) && numId > 0) {
            groupsSet.add(numId);
          }
        });
      }
      console.log('✅ Factory groups:', Array.from(groupsSet));
    } catch (error) {
      console.error('⚠️ Error getting factory groups:', error);
    }

    // 2. Check treasury for groups where user is a member
    // Get total group count from factory
    try {
      const countResult = await callReadOnlyFunction({
        contractAddress: CONTRACTS.EXPENSE_FACTORY.split('.')[0],
        contractName: CONTRACTS.EXPENSE_FACTORY.split('.')[1],
        functionName: 'get-total-groups-count',
        functionArgs: [],
        network: stacksNetwork,
        senderAddress: userAddress
      });

      const totalGroups = Number(cvToValue(countResult)) || 0;
      console.log(`🔍 Checking ${totalGroups} total groups for membership...`);

      // Check each group to see if user is a member
      for (let groupId = 1; groupId <= totalGroups; groupId++) {
        try {
          const memberInfo = await getMemberInfo(groupId, userAddress);
          if (memberInfo && memberInfo.active) {
            groupsSet.add(groupId);
            console.log(`✅ Found user as member in group ${groupId}`);
          }
        } catch (error) {
          // Member not found in this group, continue
        }
      }
    } catch (error) {
      console.error('⚠️ Error checking treasury memberships:', error);
    }

    const groups = Array.from(groupsSet).sort((a, b) => a - b);
    console.log('✅ Final user groups (from both contracts):', groups);
    return groups;
  } catch (error) {
    console.error('❌ Error getting user groups:', error);
    return [];
  }
};

// Get group details from treasury contract
export const getGroup = async (groupId: number): Promise<any> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-group',
      functionArgs: [uintCV(groupId)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    const value = cvToValue(result);
    let unwrappedValue = value;

    // Unwrap optional if present
    if (value && typeof value === 'object' && 'value' in value) {
      unwrappedValue = value.value;
    }

    // Deep unwrap nested Clarity values
    if (unwrappedValue && typeof unwrappedValue === 'object') {
      return deepUnwrapClarityValue(unwrappedValue);
    }

    return unwrappedValue;
  } catch (error) {
    console.error('Error getting group details:', error);
    return null;
  }
};

// Get member info
export const getMemberInfo = async (groupId: number, memberAddress: string): Promise<any> => {
  try {
    // Validate groupId
    if (groupId === undefined || groupId === null || isNaN(groupId)) {
      console.error('Invalid groupId for getMemberInfo:', groupId);
      return null;
    }

    const validGroupId = Math.floor(Number(groupId));

    console.log('👤 Fetching member info for groupId:', validGroupId, 'memberAddress:', memberAddress);

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-member-info',
      functionArgs: [uintCV(validGroupId), principalCV(memberAddress)],
      network: stacksNetwork,
      senderAddress: memberAddress
    });

    const value = cvToValue(result);
    console.log('✅ Member info fetched (raw):', value);

    let unwrappedValue = value;
    // Unwrap optional if present
    if (value && typeof value === 'object' && 'value' in value) {
      unwrappedValue = value.value;
      console.log('✅ Member info unwrapped:', unwrappedValue);
    }

    // Deep unwrap nested Clarity values
    if (unwrappedValue && typeof unwrappedValue === 'object') {
      const processed = deepUnwrapClarityValue(unwrappedValue);
      console.log('✅ Member info fully processed:', processed);
      return processed;
    }

    console.log('✅ Member info (direct):', unwrappedValue);
    return unwrappedValue;
  } catch (error) {
    console.error('Error getting member info for groupId', groupId, ':', error);
    return null;
  }
};

// Get expense details
export const getExpense = async (groupId: number, expenseId: number): Promise<any> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-expense',
      functionArgs: [uintCV(groupId), uintCV(expenseId)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    const value = cvToValue(result);
    let unwrappedValue = value;

    // Unwrap optional if present
    if (value && typeof value === 'object' && 'value' in value) {
      unwrappedValue = value.value;
    }

    // Deep unwrap nested Clarity values
    if (unwrappedValue && typeof unwrappedValue === 'object') {
      return deepUnwrapClarityValue(unwrappedValue);
    }

    return unwrappedValue;
  } catch (error) {
    console.error('Error getting expense:', error);
    return null;
  }
};

// Get balance between two members
export const getBalance = async (groupId: number, debtor: string, creditor: string): Promise<number> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-balance',
      functionArgs: [uintCV(groupId), principalCV(debtor), principalCV(creditor)],
      network: stacksNetwork,
      senderAddress: debtor
    });

    return cvToValue(result) as number;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

// Get net balance for a member
export const getNetBalance = async (groupId: number, memberAddress: string): Promise<number> => {
  try {
    // Validate groupId
    if (groupId === undefined || groupId === null || isNaN(groupId)) {
      console.error('Invalid groupId for getNetBalance:', groupId);
      return 0;
    }

    const validGroupId = Math.floor(Number(groupId));

    console.log('💰 Fetching net balance for groupId:', validGroupId, 'memberAddress:', memberAddress);

    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-net-balance',
      functionArgs: [uintCV(validGroupId), principalCV(memberAddress)],
      network: stacksNetwork,
      senderAddress: memberAddress
    });

    console.log('💰 Raw Clarity result:', result);
    console.log('💰 Result type:', result.type);
    console.log('💰 Result type name:', result.type === 7 ? 'ResponseOk' : result.type === 8 ? 'ResponseErr' : 'Other');

    // Check if it's an error response (ClarityType.ResponseErr = 8)
    if (result.type === 8) {
      console.log('ℹ️ Error response detected (member not found in treasury), returning 0');
      return 0;
    }

    // For ResponseOk (type 7), the actual value is in result.value
    let balanceValue;
    if (result.type === 7) {
      console.log('💰 ResponseOk detected, extracting value from result.value');
      balanceValue = result.value;
    } else {
      balanceValue = result;
    }

    const response = cvToValue(balanceValue);
    console.log('✅ Net balance cvToValue response:', response);

    // Unwrap the response value
    const unwrapped = deepUnwrapClarityValue(response);
    console.log('✅ Net balance unwrapped:', unwrapped);

    const finalBalance = Number(unwrapped) || 0;
    console.log('✅ Final balance value:', finalBalance);

    return finalBalance;
  } catch (error) {
    console.error('Error getting net balance for groupId', groupId, ':', error);
    return 0;
  }
};

// Get group stats
export const getGroupStats = async (groupId: number): Promise<any> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-group-stats',
      functionArgs: [uintCV(groupId)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    const response = cvToValue(result);

    // Handle optional return value
    let unwrappedValue = response;
    if (response && typeof response === 'object' && 'value' in response) {
      unwrappedValue = response.value;
    }

    // Deep unwrap all nested Clarity values
    if (unwrappedValue && typeof unwrappedValue === 'object') {
      return deepUnwrapClarityValue(unwrappedValue);
    }

    return unwrappedValue;
  } catch (error) {
    console.error('Error getting group stats:', error);
    return null;
  }
};

// Check transaction status
export const checkTransactionStatus = async (txId: string): Promise<any> => {
  try {
    const response = await fetch(`${NETWORK_INFO.nodeUrl}/extended/v1/tx/${txId}`);
    return await response.json();
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return null;
  }
};

// Get STX to USD price (for display purposes)
export const getStxPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stacks&vs_currencies=usd');
    const data = await response.json();
    return data.stacks?.usd || 0;
  } catch (error) {
    console.error('Error getting STX price:', error);
    return 0;
  }
};

// Format STX amount for display
export const formatStxAmount = (microStx: number): string => {
  const stx = microStx / 1000000;
  return `${stx.toFixed(6)} STX`;
};

// Convert STX to microSTX
export const stxToMicroStx = (stx: number): number => {
  return Math.floor(stx * 1000000);
};

// Convert microSTX to STX
export const microStxToStx = (microStx: number): number => {
  return microStx / 1000000;
};

// Get member at specific index
export const getMemberAtIndex = async (groupId: number, index: number): Promise<string | null> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-member-at-index',
      functionArgs: [uintCV(groupId), uintCV(index)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    const value = cvToValue(result);
    const unwrapped = deepUnwrapClarityValue(value);
    return unwrapped || null;
  } catch (error) {
    console.error('Error getting member at index:', error);
    return null;
  }
};

// Get all members for a group
export const getGroupMembers = async (groupId: number): Promise<Array<{address: string, nickname: string, active: boolean}>> => {
  try {
    // First get the member count from group stats
    const stats = await getGroupStats(groupId);
    const memberCount = Number(stats?.['member-count']) || 0;

    console.log(`📋 Fetching ${memberCount} members for group ${groupId}`);

    const members: Array<{address: string, nickname: string, active: boolean}> = [];

    // Fetch each member
    for (let i = 0; i < memberCount; i++) {
      const memberAddress = await getMemberAtIndex(groupId, i);
      if (memberAddress) {
        const memberInfo = await getMemberInfo(groupId, memberAddress);
        if (memberInfo) {
          members.push({
            address: memberAddress,
            nickname: memberInfo.nickname || 'Unknown',
            active: memberInfo.active || false
          });
        }
      }
    }

    console.log(`✅ Fetched ${members.length} members:`, members);
    return members;
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

// Get all creditors a user owes money to
export const getUserCreditors = async (groupId: number, userAddress: string): Promise<Array<{address: string, amount: number}>> => {
  try {
    console.log(`💰 Finding creditors for user ${userAddress} in group ${groupId}`);

    const members = await getGroupMembers(groupId);
    const creditors: Array<{address: string, amount: number}> = [];

    // Check balance with each member
    for (const member of members) {
      if (member.address !== userAddress && member.active) {
        try {
          const debt = await getBalance(groupId, userAddress, member.address);
          const debtAmount = Number(debt) || 0;

          if (debtAmount > 0) {
            console.log(`💸 User owes ${debtAmount} microSTX to ${member.address}`);
            creditors.push({
              address: member.address,
              amount: debtAmount
            });
          }
        } catch (error) {
          console.log(`⚠️ Could not check balance with ${member.address}`);
        }
      }
    }

    console.log(`✅ Found ${creditors.length} creditors:`, creditors);
    return creditors;
  } catch (error) {
    console.error('Error getting user creditors:', error);
    return [];
  }
};

// Get settlement details
export const getSettlement = async (groupId: number, settlementId: number): Promise<any> => {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACTS.GROUP_TREASURY.split('.')[0],
      contractName: CONTRACTS.GROUP_TREASURY.split('.')[1],
      functionName: 'get-settlement',
      functionArgs: [uintCV(groupId), uintCV(settlementId)],
      network: stacksNetwork,
      senderAddress: getUserStxAddress() || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });

    const value = cvToValue(result);
    let unwrappedValue = value;

    // Unwrap optional if present
    if (value && typeof value === 'object' && 'value' in value) {
      unwrappedValue = value.value;
    }

    // Deep unwrap nested Clarity values
    if (unwrappedValue && typeof unwrappedValue === 'object') {
      return deepUnwrapClarityValue(unwrappedValue);
    }

    return unwrappedValue;
  } catch (error) {
    console.error('Error getting settlement:', error);
    return null;
  }
};

// Get all settlements for a group
export const getAllSettlements = async (groupId: number): Promise<Array<{
  settlementId: number;
  debtor: string;
  creditor: string;
  amount: number;
  timestamp: number;
}>> => {
  try {
    console.log(`💳 Fetching all settlements for group ${groupId}`);

    // Get total settlements count from group stats
    const stats = await getGroupStats(groupId);
    const totalSettlements = Number(stats?.['total-settlements']) || 0;

    console.log(`📋 Found ${totalSettlements} total settlements`);

    const settlements: Array<{
      settlementId: number;
      debtor: string;
      creditor: string;
      amount: number;
      timestamp: number;
    }> = [];

    // Fetch each settlement (settlementIds start from 1)
    for (let i = 1; i <= totalSettlements; i++) {
      const settlement = await getSettlement(groupId, i);
      if (settlement) {
        settlements.push({
          settlementId: i,
          debtor: settlement.debtor,
          creditor: settlement.creditor,
          amount: Number(settlement.amount) || 0,
          timestamp: Number(settlement.timestamp) || 0
        });
      }
    }

    console.log(`✅ Fetched ${settlements.length} settlements:`, settlements);
    return settlements.reverse(); // Most recent first
  } catch (error) {
    console.error('Error getting all settlements:', error);
    return [];
  }
};