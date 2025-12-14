'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showContractCall } from '@stacks/connect';
import { stringAsciiCV, AnchorMode, PostConditionMode, uintCV, principalCV, listCV } from '@stacks/transactions';
import {
  createGroup,
  initializeGroup,
  addMemberToGroup,
  addExpense,
  settleDebtSTX,
  getUserGroups,
  getGroupInfo,
  getGroup,
  getMemberInfo,
  getBalance,
  getNetBalance,
  getGroupStats,
  checkTransactionStatus
} from './contracts';
import { useStacks } from './StacksProvider';
import { stacksNetwork } from './stacks';

// Use environment variables for contract configuration
// Clarity 4 deployment with stacks-block-time
const DEPLOYER = process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS || 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84';
const FACTORY_CONTRACT = process.env.NEXT_PUBLIC_FACTORY_CONTRACT || 'expense-factory';
const TREASURY_CONTRACT = process.env.NEXT_PUBLIC_TREASURY_CONTRACT || 'group-treasury';

// Validate environment variables in production
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DEPLOYER_ADDRESS) {
  console.error('⚠️ WARNING: NEXT_PUBLIC_DEPLOYER_ADDRESS not set in production!');
}

// Create group hook - Now with ONE transaction (contract auto-initializes treasury)
export function useCreateGroup() {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const createGroupFn = async (groupName: string, creatorNickname: string) => {
    console.log('🚀 Starting group creation...', { groupName, creatorNickname, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing create-group contract call (will auto-initialize treasury)...');

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: FACTORY_CONTRACT,
        functionName: 'create-group',
        functionArgs: [
          stringAsciiCV(groupName),
          stringAsciiCV(creatorNickname)
        ],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Circle creation transaction submitted:', data.txId);
          setTxId(data.txId);

          // Wait for transaction to settle (simplified - no WebSocket)
          console.log('⏳ Waiting for transaction to confirm...');
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Refresh groups list
          await queryClient.invalidateQueries({ queryKey: ['userGroups', address] });
          await queryClient.refetchQueries({ queryKey: ['userGroups', address] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Circle created successfully!');
        },
        onCancel: () => {
          console.log('❌ Transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing contract call to wallet...');
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error creating group:', err);
      setError(err.message || 'Failed to create group');
      setIsLoading(false);
    }
  };

  return {
    createGroup: createGroupFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}

// User groups hook
export function useUserGroups(userAddress?: string) {
  return useQuery({
    queryKey: ['userGroups', userAddress],
    queryFn: async () => {
      if (!userAddress) {
        console.log('⚠️ No user address provided to useUserGroups');
        return [];
      }
      console.log('🔄 useUserGroups: Fetching groups for', userAddress);
      const groups = await getUserGroups(userAddress);
      console.log('🔄 useUserGroups: Received groups:', groups);
      return groups;
    },
    enabled: !!userAddress,
    staleTime: 10000, // 10 seconds - reduced for testing
    gcTime: 5000, // Garbage collection time
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Group info hook
export function useGroupInfo(groupId?: number) {
  return useQuery({
    queryKey: ['groupInfo', groupId],
    queryFn: () => groupId !== undefined ? getGroupInfo(groupId) : Promise.resolve(null),
    enabled: groupId !== undefined,
    staleTime: 60000, // 1 minute
  });
}

// Group details hook (from treasury contract)
export function useGroup(groupId?: number) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupId !== undefined ? getGroup(groupId) : Promise.resolve(null),
    enabled: groupId !== undefined,
    staleTime: 30000,
  });
}

// Member info hook
export function useMemberInfo(groupId?: number, memberAddress?: string) {
  return useQuery({
    queryKey: ['memberInfo', groupId, memberAddress],
    queryFn: () => 
      groupId !== undefined && memberAddress 
        ? getMemberInfo(groupId, memberAddress) 
        : Promise.resolve(null),
    enabled: groupId !== undefined && !!memberAddress,
    staleTime: 30000,
  });
}

// Balance hook
export function useBalance(groupId?: number, debtor?: string, creditor?: string) {
  return useQuery({
    queryKey: ['balance', groupId, debtor, creditor],
    queryFn: () => 
      groupId !== undefined && debtor && creditor
        ? getBalance(groupId, debtor, creditor)
        : Promise.resolve(0),
    enabled: groupId !== undefined && !!debtor && !!creditor,
    staleTime: 15000,
  });
}

// Net balance hook
export function useNetBalance(groupId?: number, memberAddress?: string) {
  return useQuery({
    queryKey: ['netBalance', groupId, memberAddress],
    queryFn: () => 
      groupId !== undefined && memberAddress
        ? getNetBalance(groupId, memberAddress)
        : Promise.resolve(0),
    enabled: groupId !== undefined && !!memberAddress,
    staleTime: 15000,
  });
}

// Group stats hook
export function useGroupStats(groupId?: number) {
  return useQuery({
    queryKey: ['groupStats', groupId],
    queryFn: () => groupId !== undefined ? getGroupStats(groupId) : Promise.resolve(null),
    enabled: groupId !== undefined,
    staleTime: 30000,
  });
}

// Add member hook - using Stacks Connect
export function useAddMember(groupId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const addMemberFn = async (memberAddress: string, nickname: string) => {
    console.log('🚀 Adding member...', { groupId, memberAddress, nickname, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!groupId) {
      const errorMsg = 'Group ID is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing add-member contract call...');

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: TREASURY_CONTRACT,
        functionName: 'add-member',
        functionArgs: [
          uintCV(groupId),
          principalCV(memberAddress),
          stringAsciiCV(nickname)
        ],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Member invited to circle:', data.txId);
          setTxId(data.txId);

          // Wait for confirmation
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupStats', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['memberInfo', groupId, memberAddress] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Member added to circle successfully!');
        },
        onCancel: () => {
          console.log('❌ Add member transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing add-member contract call to wallet...', txOptions);
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error adding member:', err);
      setError(err.message || 'Failed to add member');
      setIsLoading(false);
    }
  };

  return {
    addMember: addMemberFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}

// Add expense hook - using Stacks Connect
export function useAddExpense(groupId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const addExpenseFn = async (description: string, amountSTX: string, participants: string[]) => {
    console.log('🚀 Adding expense...', { groupId, description, amountSTX, participants, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!groupId) {
      const errorMsg = 'Group ID is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (participants.length === 0) {
      const errorMsg = 'At least one participant is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing add-expense contract call...');

      // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
      const amountMicroSTX = Math.floor(parseFloat(amountSTX) * 1_000_000);

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: TREASURY_CONTRACT,
        functionName: 'add-expense',
        functionArgs: [
          uintCV(groupId),
          stringAsciiCV(description),
          uintCV(amountMicroSTX),
          listCV(participants.map(addr => principalCV(addr)))
        ],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Care shared successfully:', data.txId);
          setTxId(data.txId);

          // Wait for confirmation (longer for blockchain to process)
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Invalidate ALL relevant queries to force refetch
          await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupStats', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['netBalance', groupId] }); // More specific
          await queryClient.invalidateQueries({ queryKey: ['memberInfo', groupId] }); // Refetch member info too
          await queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] }); // Refetch member list

          // Force refetch to update UI
          await queryClient.refetchQueries({ queryKey: ['netBalance', groupId, address] });
          await queryClient.refetchQueries({ queryKey: ['groupStats', groupId] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Care shared with circle!');
        },
        onCancel: () => {
          console.log('❌ Add expense transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing add-expense contract call to wallet...', txOptions);
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error adding expense:', err);
      setError(err.message || 'Failed to add expense');
      setIsLoading(false);
    }
  };

  return {
    addExpense: addExpenseFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}

// Settle debt hook - using Stacks Connect
export function useSettleDebt(groupId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const settleDebtFn = async (creditorAddress: string, amountSTX: string) => {
    console.log('🚀 Settling debt...', { groupId, creditorAddress, amountSTX, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!groupId) {
      const errorMsg = 'Group ID is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing settle-debt contract call...');

      // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
      const amountMicroSTX = Math.floor(parseFloat(amountSTX) * 1_000_000);

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: TREASURY_CONTRACT,
        functionName: 'settle-debt-stx',
        functionArgs: [
          uintCV(groupId),
          principalCV(creditorAddress),
          uintCV(amountMicroSTX)
        ],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Care flowed forward:', data.txId);
          setTxId(data.txId);

          // Wait for confirmation
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Invalidate ALL relevant queries to force refetch
          await queryClient.invalidateQueries({ queryKey: ['balance', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['netBalance', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['memberInfo', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupStats', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupSettlements', groupId] });

          // Force refetch to update UI
          await queryClient.refetchQueries({ queryKey: ['netBalance', groupId, address] });
          await queryClient.refetchQueries({ queryKey: ['memberInfo', groupId, address] });
          await queryClient.refetchQueries({ queryKey: ['groupSettlements', groupId] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Circle completed!');
        },
        onCancel: () => {
          console.log('❌ Settle debt transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing settle-debt contract call to wallet...', txOptions);
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error settling debt:', err);
      setError(err.message || 'Failed to settle debt');
      setIsLoading(false);
    }
  };

  return {
    settleDebt: settleDebtFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}

// Transaction status hook
export function useTransactionStatus(txId?: string) {
  return useQuery({
    queryKey: ['transactionStatus', txId],
    queryFn: () => txId ? checkTransactionStatus(txId) : Promise.resolve(null),
    enabled: !!txId,
    refetchInterval: 5000, // Check every 5 seconds
    staleTime: 0, // Always consider stale
  });
}

// Utility hook for getting user's wallet info
export function useWalletInfo() {
  const { connected, address } = useStacks();

  return {
    isConnected: connected,
    address,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
  };
}

// Group members hook
export function useGroupMembers(groupId?: number) {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { getGroupMembers } = await import('./contracts');
      return getGroupMembers(groupId);
    },
    enabled: groupId !== undefined,
    staleTime: 30000, // 30 seconds
  });
}

// User creditors hook - finds who the user owes money to
export function useUserCreditors(groupId?: number, userAddress?: string) {
  return useQuery({
    queryKey: ['userCreditors', groupId, userAddress],
    queryFn: async () => {
      if (!groupId || !userAddress) return [];
      const { getUserCreditors } = await import('./contracts');
      return getUserCreditors(groupId, userAddress);
    },
    enabled: groupId !== undefined && !!userAddress,
    staleTime: 15000, // 15 seconds
  });
}

// Group settlements hook - gets all settlement history for a group
export function useGroupSettlements(groupId?: number) {
  return useQuery({
    queryKey: ['groupSettlements', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { getAllSettlements } = await import('./contracts');
      return getAllSettlements(groupId);
    },
    enabled: groupId !== undefined,
    staleTime: 30000, // 30 seconds
  });
}

// Pause group (close nest) hook
export function usePauseGroup(groupId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const pauseGroupFn = async () => {
    console.log('🔒 Pausing group (closing circle)...', { groupId, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!groupId) {
      const errorMsg = 'Group ID is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing pause-group contract call...');

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: TREASURY_CONTRACT,
        functionName: 'pause-group',
        functionArgs: [uintCV(groupId)],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Pause group transaction submitted:', data.txId);
          setTxId(data.txId);

          // Wait for confirmation
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupStats', groupId] });

          // Force refetch
          await queryClient.refetchQueries({ queryKey: ['groupStats', groupId] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Circle closed successfully!');
        },
        onCancel: () => {
          console.log('❌ Pause group transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing pause-group contract call to wallet...', txOptions);
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error pausing group:', err);
      setError(err.message || 'Failed to pause group');
      setIsLoading(false);
    }
  };

  return {
    pauseGroup: pauseGroupFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}

// Unpause group (reopen nest) hook
export function useUnpauseGroup(groupId?: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { connected, address } = useStacks();

  const unpauseGroupFn = async () => {
    console.log('🔓 Unpausing group (reopening circle)...', { groupId, connected, address });

    if (!connected || !address) {
      const errorMsg = 'Please connect your Stacks wallet first';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!groupId) {
      const errorMsg = 'Group ID is required';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('📝 Preparing unpause-group contract call...');

      const txOptions = {
        contractAddress: DEPLOYER,
        contractName: TREASURY_CONTRACT,
        functionName: 'unpause-group',
        functionArgs: [uintCV(groupId)],
        network: stacksNetwork,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        appDetails: {
          name: 'CircleCare',
          icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
        },
        onFinish: async (data: any) => {
          console.log('✅ Unpause group transaction submitted:', data.txId);
          setTxId(data.txId);

          // Wait for confirmation
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Invalidate relevant queries
          await queryClient.invalidateQueries({ queryKey: ['group', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupInfo', groupId] });
          await queryClient.invalidateQueries({ queryKey: ['groupStats', groupId] });

          // Force refetch
          await queryClient.refetchQueries({ queryKey: ['groupStats', groupId] });

          setIsLoading(false);
          setIsSuccess(true);
          console.log('🎉 Circle reopened successfully!');
        },
        onCancel: () => {
          console.log('❌ Unpause group transaction cancelled by user');
          setIsLoading(false);
          setError('Transaction cancelled');
        },
      };

      console.log('💬 Showing unpause-group contract call to wallet...', txOptions);
      await showContractCall(txOptions);

    } catch (err: any) {
      console.error('❌ Error unpausing group:', err);
      setError(err.message || 'Failed to unpause group');
      setIsLoading(false);
    }
  };

  return {
    unpauseGroup: unpauseGroupFn,
    isLoading,
    isPending: isLoading,
    txId,
    error,
    isSuccess,
  };
}