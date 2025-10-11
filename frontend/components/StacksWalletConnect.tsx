'use client';

import React, { useState } from 'react';
import { useStacks } from '@/lib/StacksProvider';
import { formatAddress } from '@/lib/stacks';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Wallet, LogOut, ChevronDown, Copy, Check } from 'lucide-react';

interface StacksWalletConnectProps {
  className?: string;
  showBalance?: boolean;
}

export default function StacksWalletConnect({
  className = '',
  showBalance = true // Changed default to true
}: StacksWalletConnectProps) {
  const { connected, address, connecting, connect, disconnect } = useStacks();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (connected && address) {
      // Always fetch STX balance when connected
      fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/address/${address}/stx`)
        .then(res => res.json())
        .then(data => {
          const stxBalance = parseInt(data.balance) / 1000000;
          setBalance(stxBalance);
        })
        .catch(err => console.error('Error fetching balance:', err));
    }
  }, [connected, address]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (connected && address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-200 group"
        >
          {/* Wallet Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>

          {/* Balance and Address */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              {showBalance && balance !== null ? (
                <span className="text-lg font-bold text-white">
                  {balance.toFixed(2)} STX
                </span>
              ) : (
                <div className="w-16 h-5 bg-white/10 rounded animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-circlecare-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/70 font-medium">
                {formatAddress(address)}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden">
              {/* Address Section */}
              <div className="p-4 border-b border-white/10">
                <div className="text-xs text-white/50 mb-1 font-medium">Wallet Address</div>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-white/90 font-mono">
                    {address.slice(0, 8)}...{address.slice(-8)}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-white/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance Section */}
              {showBalance && balance !== null && (
                <div className="p-4 border-b border-white/10">
                  <div className="text-xs text-white/50 mb-1 font-medium">Balance</div>
                  <div className="text-2xl font-bold text-white">
                    {balance.toFixed(6)} STX
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Testnet
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Disconnect Wallet</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={connecting}
      className="bg-gradient-to-r from-circlecare-500 to-circlecare-purple-500 hover:from-circlecare-600 hover:to-circlecare-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {connecting ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Stacks Wallet
        </div>
      )}
    </Button>
  );
}

// Alternative compact version for headers/navbars
export function CompactStacksWalletConnect({ className = '' }: { className?: string }) {
  const { connected, address, connecting, connect, disconnect } = useStacks();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (connected && address) {
      fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/address/${address}/stx`)
        .then(res => res.json())
        .then(data => {
          const stxBalance = parseInt(data.balance) / 1000000;
          setBalance(stxBalance);
        })
        .catch(err => console.error('Error fetching balance:', err));
    }
  }, [connected, address]);

  if (connected && address) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg hover:bg-white/15 transition-all"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-500 rounded-md flex items-center justify-center">
            <Wallet className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium text-white">
            {balance !== null ? `${balance.toFixed(2)} STX` : formatAddress(address)}
          </span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-20 p-2">
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-md transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={connecting}
      size="sm"
      className="bg-gradient-to-r from-circlecare-500 to-circlecare-purple-500 hover:from-circlecare-600 hover:to-circlecare-purple-600 text-white"
    >
      {connecting ? <LoadingSpinner size="sm" /> : (
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Connect
        </div>
      )}
    </Button>
  );
}