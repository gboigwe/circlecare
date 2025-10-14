'use client';

import React from 'react';
import { 
  showConnect,
  disconnect,
  getUserData,
  getUserSession
} from '@stacks/connect';

import { 
  StacksMainnet, 
  StacksTestnet 
} from '@stacks/network';

// Network configuration - switch to StacksMainnet for production
export const stacksNetwork = new StacksTestnet();

export const STACKS_NETWORK_CONFIG = {
  name: 'Stacks Testnet',
  chainId: 'testnet',
  nodeUrl: 'https://stacks-node-api.testnet.stacks.co',
  coreApiUrl: 'https://stacks-node-api.testnet.stacks.co',
  explorerUrl: 'https://explorer.stacks.co/?chain=testnet'
};

// Connect to Stacks wallet using proper API
export const connectStacksWallet = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const authOptions = {
      appDetails: {
        name: 'KindNest',
        icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.svg' : '',
      },
      onFinish: (authData: any) => {
        console.log('Wallet connected:', authData);
        resolve(true);
      },
      onCancel: () => {
        console.log('Wallet connection cancelled');
        resolve(false);
      },
    };
    
    try {
      showConnect(authOptions);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      resolve(false);
    }
  });
};

// Disconnect wallet using proper API
export const disconnectStacksWallet = (): void => {
  try {
    disconnect();
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

// Check connection status using proper API
export const isStacksWalletConnected = (): boolean => {
  try {
    const userSession = getUserSession();
    return userSession.isUserSignedIn();
  } catch (error) {
    console.error('Error checking connection status:', error);
    return false;
  }
};

// Get wallet data using proper API
export const getStacksWalletData = () => {
  try {
    const userSession = getUserSession();
    if (userSession.isUserSignedIn()) {
      return userSession.loadUserData();
    }
    return null;
  } catch (error) {
    console.error('Error getting wallet data:', error);
    return null;
  }
};

// Get user's STX address
export const getUserStxAddress = (): string | null => {
  try {
    const userSession = getUserSession();
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      if (userData?.profile?.stxAddress) {
        return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting STX address:', error);
    return null;
  }
};

// Get user's BTC address (for sBTC operations)
export const getUserBtcAddress = (): string | null => {
  try {
    const userSession = getUserSession();
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      if (userData?.profile?.btcAddress) {
        return userData.profile.btcAddress.p2wpkh?.testnet || userData.profile.btcAddress.p2wpkh?.mainnet;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting BTC address:', error);
    return null;
  }
};

// Get formatted address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Get STX balance
export const getStxBalance = async (address: string): Promise<number> => {
  try {
    const response = await fetch(
      `${STACKS_NETWORK_CONFIG.coreApiUrl}/extended/v1/address/${address}/stx`
    );
    const data = await response.json();
    return parseInt(data.balance) / 1000000; // Convert microSTX to STX
  } catch (error) {
    console.error('Failed to fetch STX balance:', error);
    return 0;
  }
};

// Wallet connection hook for React components
export const useStacksWallet = () => {
  const [connected, setConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [connecting, setConnecting] = React.useState(false);

  // Check initial connection state
  React.useEffect(() => {
    const checkInitialConnection = () => {
      const isWalletConnected = isStacksWalletConnected();
      setConnected(isWalletConnected);
      if (isWalletConnected) {
        const addr = getUserStxAddress();
        setAddress(addr);
      }
    };

    checkInitialConnection();
  }, []);

  // Listen for storage changes to detect wallet connection/disconnection
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('blockstack') || e.key === null) {
        const isWalletConnected = isStacksWalletConnected();
        setConnected(isWalletConnected);
        if (isWalletConnected) {
          const addr = getUserStxAddress();
          setAddress(addr);
        } else {
          setAddress(null);
        }
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleConnect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      const success = await connectStacksWallet();
      if (success) {
        // Connection state will be updated by storage event listener
        const addr = getUserStxAddress();
        setAddress(addr);
        setConnected(true);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectStacksWallet();
    setConnected(false);
    setAddress(null);
  };

  return {
    connected,
    address,
    connecting,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };
};