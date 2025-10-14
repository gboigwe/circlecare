'use client';

import { useEffect, useState } from 'react';
import { useStacks } from '@/lib/StacksProvider';

export function NetworkTest() {
  const { connected } = useStacks();
  const [stacksTest, setStacksTest] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    result?: string;
    error?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    const testStacksAPI = async () => {
      setStacksTest({ status: 'loading' });
      try {
        const response = await fetch('https://stacks-node-api.testnet.stacks.co/extended/v1/block');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setStacksTest({
          status: 'success',
          result: `Block: ${data.results?.[0]?.height || 'Unknown'}`,
        });
      } catch (error: any) {
        setStacksTest({
          status: 'error',
          error: error.message || 'Unknown error',
        });
      }
    };

    if (connected) {
      testStacksAPI();
      // Test every 30 seconds
      const interval = setInterval(testStacksAPI, 30000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  if (!connected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <div className="text-orange-400 font-bold mb-2">🔍 Stacks Network Debug</div>
      
      <div className="space-y-1">
        <div>
          Network: Stacks Testnet ✅
        </div>
        
        <div>
          API Status: {
            stacksTest.status === 'loading' ? '⏳' :
            stacksTest.status === 'error' ? `❌ ${stacksTest.error}` :
            stacksTest.status === 'success' ? `✅ ${stacksTest.result}` :
            '?'
          }
        </div>
        
        <div className="text-orange-300 mt-2">
          Contracts: STDCC18...
        </div>
      </div>
    </div>
  );
}