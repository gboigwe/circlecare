'use client';

import React, { useEffect, useState } from 'react';
import { useStacks } from '@/lib/StacksProvider';
import StacksWalletConnect from '@/components/StacksWalletConnect';
import { useRouter } from 'next/navigation';
import { Plus, Users, Wallet, Heart, Leaf, RefreshCw, Receipt, HandHeart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { NetworkTest } from '@/components/NetworkTest';
import { useCreateGroup, useUserGroups, useGroupInfo, useMemberInfo, useNetBalance, useGroupStats } from '@/lib/stacksHooks';

export default function Dashboard() {
  const { address, connected } = useStacks();
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [nickname, setNickname] = useState('');

  const { data: userGroupIds, isLoading: groupsLoading, refetch: refetchGroups, error: groupsError } = useUserGroups(address);

  // Debug logging
  useEffect(() => {
    console.log('📊 Dashboard state:', {
      address,
      connected,
      userGroupIds,
      groupsLoading,
      groupsError
    });
  }, [address, connected, userGroupIds, groupsLoading, groupsError]);
  const { createGroup, isPending, isSuccess } = useCreateGroup();

  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  useEffect(() => {
    if (isSuccess) {
      setShowCreateGroup(false);
      setGroupName('');
      setNickname('');
      refetchGroups();
    }
  }, [isSuccess, refetchGroups]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && nickname.trim()) {
      createGroup(groupName.trim(), nickname.trim());
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <Heart className="h-16 w-16 text-circlecare-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Connect Your Wallet</h2>
            <p className="text-white/70 mb-6 text-center">Connect your Stacks wallet to access your circles of care</p>
            <div className="flex justify-center">
              <StacksWalletConnect />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Circles</h1>
            <p className="text-white/80">Your circles of care and support</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                refetchGroups();
              }}
              variant="outline"
              size="sm"
              className="bg-circlecare-500/10 text-white border-circlecare-400/30 hover:bg-circlecare-500/20 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Circles
            </Button>
            <StacksWalletConnect />
          </div>
        </div>

        {/* Create Group Form */}
        {showCreateGroup && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Your Circle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Circle Name</label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Family Care Circle, Friends Support, Community Care"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-2">Your Nickname</label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="How should others see you in this circle?"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    loading={isPending}
                    disabled={!groupName.trim() || !nickname.trim()}
                  >
                    Create Your Circle
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateGroup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Groups Grid */}
        <div className="grid gap-6">
          {/* Create Group Card */}
          {!showCreateGroup && (
            <Card className="border-2 border-dashed border-circlecare-400/30 hover:border-circlecare-500 bg-white/5 backdrop-blur-lg transition-all duration-300 cursor-pointer hover:scale-105">
              <CardContent
                className="flex flex-col items-center justify-center py-12 text-center"
                onClick={() => setShowCreateGroup(true)}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg warm-glow">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create Your Circle</h3>
                <p className="text-white/70">Start something beautiful together</p>
              </CardContent>
            </Card>
          )}

          {/* User Groups */}
          {groupsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-circlecare-500/20 to-circlecare-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 float-animation">
                <Heart className="h-8 w-8 text-circlecare-400 animate-pulse" />
              </div>
              <div className="text-white text-lg font-medium mb-2">Finding your circles...</div>
              <div className="text-white/70">Gathering all the places where care flows</div>
            </div>
          ) : userGroupIds && userGroupIds.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroupIds.map((groupId, index) => (
                <GroupCard
                  key={groupId}
                  groupId={groupId}
                  userGroupIndex={index + 1}
                  totalUserGroups={userGroupIds.length}
                  userAddress={address}
                  onGroupClick={(id) => router.push(`/groups/${id}`)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-circlecare-500/20 to-circlecare-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-circlecare-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No circles yet</h3>
                <p className="text-white/70 mb-4">Create your first circle to start flowing care</p>
                <Button onClick={() => setShowCreateGroup(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your Circle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Network Debug Component */}
      <NetworkTest />
    </div>
  );
}

// Separate component to fetch and display group info
function GroupCard({
  groupId,
  userGroupIndex,
  totalUserGroups,
  userAddress,
  onGroupClick
}: {
  groupId: number;
  userGroupIndex: number;
  totalUserGroups: number;
  userAddress?: string;
  onGroupClick: (id: number) => void;
}) {
  const { data: groupInfo } = useGroupInfo(groupId);
  const { data: memberInfo } = useMemberInfo(groupId, userAddress);
  const { data: balance } = useNetBalance(groupId, userAddress);
  const { data: groupStats } = useGroupStats(groupId);

  // Check if group is paused (closed)
  const isPaused = groupStats?.paused || false;

  // Debug logging
  React.useEffect(() => {
    if (groupInfo) {
      console.log(`🔍 GroupCard ${groupId} - Group Info:`, groupInfo);
      console.log(`🔍 GroupCard ${groupId} - Name:`, groupInfo.name);
      console.log(`🔍 GroupCard ${groupId} - Name type:`, typeof groupInfo.name);
    }
  }, [groupInfo, groupId]);

  if (!groupInfo) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200/20 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200/20 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract name with multiple fallback strategies
  const getGroupName = () => {
    if (!groupInfo) return `Group #${groupId}`;

    // Try direct access
    if (groupInfo.name && typeof groupInfo.name === 'string') {
      return groupInfo.name;
    }

    // Try unwrapping if it's still wrapped
    if (groupInfo.name && typeof groupInfo.name === 'object' && 'value' in groupInfo.name) {
      return groupInfo.name.value;
    }

    // Fallback
    return `Group #${groupId}`;
  };

  const displayName = getGroupName();

  // Calculate balance from memberInfo (source of truth)
  const calculateBalanceFromMemberInfo = () => {
    if (!memberInfo) return undefined;
    const owing = Number(memberInfo['total-owing']) || 0;
    const owed = Number(memberInfo['total-owed']) || 0;
    return owing - owed; // net balance in microSTX
  };

  // Always use memberInfo as source of truth if available
  const displayBalance = memberInfo ? calculateBalanceFromMemberInfo() : balance;

  const formatBalance = (bal: any) => {
    if (bal === null || bal === undefined) return '0.00';
    const stxAmount = Number(bal) / 1_000_000; // Convert microSTX to STX
    return stxAmount.toFixed(6);
  };

  const formatCreator = (creator: any) => {
    if (!creator) return 'Unknown';
    // Handle if creator is still wrapped in an object
    const creatorStr = typeof creator === 'object' && creator.value ? creator.value : creator;
    if (typeof creatorStr === 'string') {
      return `${creatorStr.slice(0, 6)}...${creatorStr.slice(-4)}`;
    }
    return 'Unknown';
  };

  return (
    <Card
      className={`hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer bg-white/5 backdrop-blur-lg border-white/10 ${isPaused ? 'opacity-75 border-red-500/30' : ''}`}
      onClick={() => onGroupClick(groupId)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-circlecare-400" />
          {displayName}
          {isPaused && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
              <Lock className="h-3 w-3" />
              Closed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex text-white/70 items-center gap-2">
            <Heart className="h-4 w-4 text-circlecare-400" />
            Your Circle #{userGroupIndex} of {totalUserGroups}
          </div>
          <div className="flex text-white/70 items-center gap-2">
            <Receipt className="h-4 w-4 text-circlecare-400" />
            Created by {formatCreator(groupInfo.creator)}
          </div>

          {/* Member Status */}
          {(typeof groupInfo.creator === 'string' ? groupInfo.creator : groupInfo.creator?.value) === userAddress ? (
            <div className="text-circlecare-400 font-medium flex items-center gap-1">
              <Heart className="h-4 w-4" />
              🔵 You started this circle
            </div>
          ) : memberInfo ? (
            <div className="text-circlecare-purple-400 font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              🤝 You&apos;re part of this circle
            </div>
          ) : (
            <div className="text-white/50 font-medium">
              👀 Not in this circle
            </div>
          )}

          {/* Balance Display */}
          {memberInfo && displayBalance !== undefined && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
              <HandHeart className="h-4 w-4 text-circlecare-400" />
              <span className={`font-medium ${Number(displayBalance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(displayBalance) >= 0 ? '+' : ''}
                {formatBalance(displayBalance)} STX
              </span>
              <span className="text-xs text-white/50">
                {Number(displayBalance) >= 0 ? '(support flowing to you)' : '(refund needed)'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
