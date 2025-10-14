'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Users, Receipt, HandHeart, Heart, Wallet, CreditCard, Leaf, DollarSign, UserPlus, Lock, Unlock, AlertTriangle, CheckCircle, ArrowRightLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useStacks } from '@/lib/StacksProvider';
import StacksWalletConnect from '@/components/StacksWalletConnect';
import {
  useGroupInfo,
  useGroup,
  useMemberInfo,
  useNetBalance,
  useGroupStats,
  useAddMember,
  useGroupMembers,
  useAddExpense,
  useSettleDebt,
  useUserCreditors,
  usePauseGroup,
  useUnpauseGroup,
  useGroupSettlements
} from '@/lib/stacksHooks';

// Helper to format STX amounts
const formatSTX = (microStx: number | bigint): string => {
  const stx = Number(microStx) / 1_000_000;
  return stx.toFixed(6);
};

// Helper to shorten address
const shortenAddress = (addr: string): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function GroupDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { address, connected } = useStacks();
  const groupId = params.id ? parseInt(params.id as string) : undefined;

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleDebt, setShowSettleDebt] = useState(false);
  const [memberAddress, setMemberAddress] = useState('');
  const [memberNickname, setMemberNickname] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [settlementAmount, setSettlementAmount] = useState('');

  // Data hooks
  const { data: groupInfo } = useGroupInfo(groupId);
  const { data: groupData } = useGroup(groupId);
  const { data: memberInfo } = useMemberInfo(groupId, address);
  const { data: balance } = useNetBalance(groupId, address);
  const { data: groupStats } = useGroupStats(groupId);
  const { data: members, refetch: refetchMembers } = useGroupMembers(groupId);
  const { data: creditors, isLoading: creditorsLoading } = useUserCreditors(groupId, address);
  const { data: settlements, isLoading: settlementsLoading } = useGroupSettlements(groupId);

  // Action hooks
  const { addMember, isPending: addingMember, isSuccess: memberAdded, error: memberError } = useAddMember(groupId);
  const { addExpense, isPending: addingExpense, isSuccess: expenseAdded, error: expenseError } = useAddExpense(groupId);
  const { settleDebt, isPending: settling, isSuccess: debtSettled, error: settlementError } = useSettleDebt(groupId);
  const { pauseGroup, isPending: pausing, isSuccess: groupPaused } = usePauseGroup(groupId);
  const { unpauseGroup, isPending: unpausing, isSuccess: groupUnpaused } = useUnpauseGroup(groupId);

  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  useEffect(() => {
    if (memberAdded) {
      setShowAddMember(false);
      setMemberAddress('');
      setMemberNickname('');
      refetchMembers(); // Refresh member list
    }
  }, [memberAdded, refetchMembers]);

  useEffect(() => {
    if (expenseAdded) {
      setShowAddExpense(false);
      setExpenseDescription('');
      setExpenseAmount('');
      setSelectedParticipants([]);
    }
  }, [expenseAdded]);

  useEffect(() => {
    if (debtSettled) {
      setShowSettleDebt(false);
      setSettlementAmount('');
    }
  }, [debtSettled]);

  useEffect(() => {
    console.log('📊 Group Detail Data:', {
      groupId,
      groupInfo,
      groupData,
      memberInfo,
      balance,
      groupStats
    });
  }, [groupId, groupInfo, groupData, memberInfo, balance, groupStats]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <Heart className="h-16 w-16 text-circlecare-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Connect Your Wallet</h2>
            <p className="text-white/70 mb-6 text-center">Connect your Stacks wallet to access this circle</p>
            <div className="flex justify-center">
              <StacksWalletConnect />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getGroupName = (): string => {
    if (groupInfo?.name) {
      if (typeof groupInfo.name === 'string') return groupInfo.name;
      if (typeof groupInfo.name === 'object' && 'value' in groupInfo.name) {
        return groupInfo.name.value as string;
      }
    }
    return groupData?.name || `Group #${groupId}`;
  };

  // Check if user is creator OR an active member
  const isCreator = groupInfo?.creator === address;
  const isActiveMember = memberInfo && memberInfo.active;
  const isGroupMember = isCreator || isActiveMember;

  const displayName = getGroupName();

  // Check if group is paused (closed)
  const isPaused = groupStats?.paused || false;

  // Calculate balance from memberInfo if available (fallback)
  const calculateBalanceFromMemberInfo = () => {
    if (!memberInfo) return undefined;
    const owing = Number(memberInfo['total-owing']) || 0;
    const owed = Number(memberInfo['total-owed']) || 0;
    return owing - owed; // net balance in microSTX
  };

  // Always use memberInfo as source of truth if available, otherwise use balance query
  // This ensures we show the correct balance even if the query returns 0
  const displayBalance = memberInfo ? calculateBalanceFromMemberInfo() : balance;

  console.log('👤 Membership check:', {
    address,
    creator: groupInfo?.creator,
    isCreator,
    memberInfo,
    isActiveMember,
    isGroupMember
  });

  console.log('💰 Balance check:', {
    balance,
    balanceType: typeof balance,
    balanceNumber: Number(balance),
    isZero: Number(balance) === 0,
    balanceUndefined: balance === undefined,
    calculatedBalance: calculateBalanceFromMemberInfo(),
    displayBalance,
    willShowBalanceCard: isGroupMember && displayBalance !== undefined
  });

  console.log('🔍 MemberInfo details:', {
    memberInfoExists: !!memberInfo,
    active: memberInfo?.active,
    totalOwed: memberInfo?.['total-owed'],
    totalOwing: memberInfo?.['total-owing']
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberAddress.trim() && memberNickname.trim()) {
      addMember(memberAddress.trim(), memberNickname.trim());
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseDescription.trim() || !expenseAmount || selectedParticipants.length === 0) {
      alert('Please fill in all fields and select at least one participant');
      return;
    }

    console.log('💰 Adding expense:', {
      description: expenseDescription,
      amount: expenseAmount,
      participants: selectedParticipants,
      groupId
    });

    addExpense(expenseDescription.trim(), expenseAmount, selectedParticipants);
  };

  const toggleParticipant = (memberAddress: string) => {
    setSelectedParticipants(prev =>
      prev.includes(memberAddress)
        ? prev.filter(addr => addr !== memberAddress)
        : [...prev, memberAddress]
    );
  };

  const handleSettleDebt = (e: React.FormEvent) => {
    e.preventDefault();

    if (!settlementAmount) {
      alert('Please enter an amount');
      return;
    }

    // Find who to settle with (use the first/primary creditor)
    if (!creditors || creditors.length === 0) {
      alert('No outstanding debts found. Please refresh and try again.');
      return;
    }

    // Find the creditor with the highest debt (most important to settle)
    const primaryCreditor = creditors.reduce((max, curr) =>
      curr.amount > max.amount ? curr : max
    , creditors[0]);

    console.log('💳 Settling debt for group:', groupId, 'Amount:', settlementAmount, 'Creditor:', primaryCreditor.address, 'Debt:', primaryCreditor.amount);
    settleDebt(primaryCreditor.address, settlementAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Your Circles
            </Button>

            {/* Close/Reopen Circle button - only for creator */}
            {isCreator && (
              isPaused ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unpauseGroup()}
                  loading={unpausing}
                  className="bg-circlecare-500/10 text-circlecare-400 border-circlecare-400/30 hover:bg-circlecare-500/20"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Reopen Circle
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to close this circle? No new care sharing or members can be added while closed.')) {
                      pauseGroup();
                    }
                  }}
                  loading={pausing}
                  className="bg-red-500/10 text-red-400 border-red-400/30 hover:bg-red-500/20"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Close Circle
                </Button>
              )
            )}
          </div>
          <StacksWalletConnect />
        </div>

        {/* Closed Circle Warning Banner */}
        {isPaused && (
          <div className="mb-8">
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 backdrop-blur-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">This Circle is Closed</h3>
                  <p className="text-white/80">
                    No new care sharing or members can be added. {isCreator ? 'You can reopen it using the "Reopen Circle" button above.' : 'Only the creator can reopen this circle.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
            <Users className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">
              Group #{groupId}
            </span>
            {isPaused && (
              <>
                <span className="text-white/50 mx-2">•</span>
                <Lock className="h-4 w-4 text-red-400 mr-1" />
                <span className="text-red-400 text-sm font-medium">Closed</span>
              </>
            )}
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            {displayName}
          </h1>
          <p className="text-xl text-white/70">
            Share care and track balances in your circle
          </p>
        </div>

        {/* Balance Card */}
        {isGroupMember && displayBalance !== undefined && (
          <div className="mb-12">
            <div className={`bg-gradient-to-br ${Number(displayBalance) >= 0 ? 'from-circlecare-500/20 to-circlecare-purple-500/20' : 'from-red-500/20 to-pink-500/20'} backdrop-blur-lg rounded-3xl p-8 border border-white/10`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your Balance</h3>
                  <p className={`text-4xl font-black mb-3 ${Number(displayBalance) >= 0 ? 'text-circlecare-400' : 'text-red-400'}`}>
                    {Number(displayBalance) >= 0 ? '+' : ''}
                    {formatSTX(displayBalance)} STX
                  </p>
                  <p className="text-white/70 text-lg">
                    {Number(displayBalance) >= 0 ? '💝 Care flowing to you' : '🤲 Time to flow care forward'}
                  </p>
                </div>
                <div className={`w-20 h-20 ${Number(displayBalance) >= 0 ? 'bg-circlecare-500' : 'bg-red-500'} rounded-2xl flex items-center justify-center`}>
                  <HandHeart className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isGroupMember && !isPaused && (
          <div className="grid gap-4 sm:gap-6 mb-12" style={{
            gridTemplateColumns: `repeat(${
              (isCreator ? 1 : 0) + 1 + (displayBalance !== undefined && Number(displayBalance) < 0 ? 1 : 0)
            }, 1fr)`
          }}>
            {/* Only show Invite Someone to group creator */}
            {isCreator && (
              <div
                onClick={() => setShowAddMember(true)}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Invite to Circle</h3>
                      <p className="text-white/70">Grow your circle with care</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              onClick={() => setShowAddExpense(true)}
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Share Care</h3>
                    <p className="text-white/70">Share care with your circle</p>
                  </div>
                </div>
              </div>
            </div>

            {displayBalance !== undefined && Number(displayBalance) < 0 && (
              <div
                onClick={() => setShowSettleDebt(true)}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-circlecare-500/20 to-circlecare-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-circlecare-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Flow Care Forward</h3>
                      <p className="text-white/70">Complete the circle</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invite Member Form */}
        {showAddMember && (
          <div className="mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Member to Circle
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                    {memberError}
                  </div>
                )}
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-white/90 font-medium mb-2">Wallet Address</label>
                    <Input
                      value={memberAddress}
                      onChange={(e) => setMemberAddress(e.target.value)}
                      placeholder="ST..."
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      required
                    />
                    <p className="text-white/50 text-sm mt-1">Enter the Stacks wallet address of the person you want to invite</p>
                  </div>
                  <div>
                    <label className="block text-white/90 font-medium mb-2">Nickname</label>
                    <Input
                      value={memberNickname}
                      onChange={(e) => setMemberNickname(e.target.value)}
                      placeholder="How should this person appear in the circle?"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      loading={addingMember}
                      disabled={!memberAddress.trim() || !memberNickname.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                      {addingMember ? 'Sending Invitation...' : 'Send Invitation'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddMember(false)}
                      className="border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenseError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                    {expenseError}
                  </div>
                )}
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-white/90 font-medium mb-2">Description</label>
                    <Input
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="e.g., Dinner, Gas, Medical bills"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 font-medium mb-2">Amount (STX)</label>
                    <Input
                      type="number"
                      step="0.000001"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.1"
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 font-medium mb-2">
                      Split Between ({selectedParticipants.length} selected)
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 rounded-xl p-3 border border-white/10">
                      {members && members.map((member) => (
                        <label
                          key={member.address}
                          className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(member.address)}
                            onChange={() => toggleParticipant(member.address)}
                            className="w-4 h-4 rounded border-white/20"
                          />
                          <span className="text-white font-medium">{member.nickname}</span>
                          <span className="text-white/50 text-sm">{shortenAddress(member.address)}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-white/50 text-sm mt-1">
                      Expense will be split equally among selected members
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      loading={addingExpense}
                      disabled={!expenseDescription.trim() || !expenseAmount || selectedParticipants.length === 0}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {addingExpense ? 'Adding Expense...' : 'Add Expense'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddExpense(false)}
                      className="border-white/20 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settle Debt Form */}
        {showSettleDebt && (
          <div className="mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Flow Care Forward
                </CardTitle>
              </CardHeader>
              <CardContent>
                {settlementError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                    {settlementError}
                  </div>
                )}

                {creditorsLoading ? (
                  <div className="text-center py-6 text-white/70">
                    <p>Loading payment details...</p>
                  </div>
                ) : creditors && creditors.length > 0 ? (
                  <>
                    {/* Show who they're paying */}
                    <div className="mb-4 p-4 bg-white/10 rounded-xl border border-white/20">
                      <h4 className="text-white/90 font-medium mb-2">Outstanding Debts:</h4>
                      <div className="space-y-2">
                        {creditors.map((creditor, idx) => {
                          const creditorMember = members?.find(m => m.address === creditor.address);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-white/80">
                                {creditorMember?.nickname || shortenAddress(creditor.address)}
                              </span>
                              <span className="text-red-400 font-medium">
                                {formatSTX(creditor.amount)} STX
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <form onSubmit={handleSettleDebt} className="space-y-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Amount to Settle (STX)</label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={settlementAmount}
                          onChange={(e) => setSettlementAmount(e.target.value)}
                          placeholder="0.05"
                          className="bg-white/10 border-white/20 text-white placeholder-white/50"
                          required
                        />
                        <p className="text-white/50 text-sm mt-1">
                          {creditors.length > 1
                            ? `Will settle with ${members?.find(m => m.address === creditors.reduce((max, curr) => curr.amount > max.amount ? curr : max, creditors[0]).address)?.nickname || 'member'} (highest debt)`
                            : `Settling with ${members?.find(m => m.address === creditors[0].address)?.nickname || 'member'}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          loading={settling}
                          disabled={!settlementAmount}
                          className="bg-gradient-to-r from-emerald-500 to-green-500"
                        >
                          {settling ? 'Processing Payment...' : 'Send Payment'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowSettleDebt(false)}
                          className="border-white/20 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/70">No outstanding debts found.</p>
                    <Button
                      onClick={() => setShowSettleDebt(false)}
                      variant="outline"
                      className="mt-4 border-white/20 text-white"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Group Stats */}
        {groupStats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Members</p>
                    <p className="text-2xl font-bold text-white">{Number(groupStats['member-count']) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Total Expenses</p>
                    <p className="text-2xl font-bold text-white">{Number(groupStats['total-expenses']) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Settlements</p>
                    <p className="text-2xl font-bold text-white">{Number(groupStats['total-settlements']) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Members List */}
        {isGroupMember && members && members.length > 0 && (
          <div className="mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Circle Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.address}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-circlecare-500 to-circlecare-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {member.address.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{member.nickname}</div>
                          <div className="text-white/70 text-sm">{shortenAddress(member.address)}</div>
                          {member.address === address && (
                            <div className="text-circlecare-400 text-sm font-medium flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              You
                            </div>
                          )}
                          {member.address === groupInfo?.creator && (
                            <div className="text-circlecare-purple-400 text-sm font-medium flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              Circle Keeper
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${member.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settlement History */}
        {isGroupMember && (
          <div className="mb-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {settlementsLoading ? (
                  <div className="text-center py-8 text-white/70">
                    <div className="animate-pulse">Loading settlement history...</div>
                  </div>
                ) : settlements && settlements.length > 0 ? (
                  <div className="space-y-3">
                    {settlements.map((settlement) => {
                      const debtor = members?.find(m => m.address === settlement.debtor);
                      const creditor = members?.find(m => m.address === settlement.creditor);
                      const isUserInvolved = settlement.debtor === address || settlement.creditor === address;

                      return (
                        <div
                          key={settlement.settlementId}
                          className={`p-4 rounded-2xl border transition-all duration-300 ${
                            isUserInvolved
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-white font-medium">
                                    {settlement.debtor === address ? 'You' : debtor?.nickname || shortenAddress(settlement.debtor)}
                                  </span>
                                  <ArrowRightLeft className="h-4 w-4 text-white/50" />
                                  <span className="text-white font-medium">
                                    {settlement.creditor === address ? 'You' : creditor?.nickname || shortenAddress(settlement.creditor)}
                                  </span>
                                </div>
                                <div className="text-emerald-400 font-bold text-lg mb-1">
                                  {formatSTX(settlement.amount)} STX
                                </div>
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                  <Clock className="h-3 w-3" />
                                  <span>Block #{settlement.timestamp}</span>
                                  {isUserInvolved && (
                                    <span className="ml-2 text-emerald-400 font-medium">
                                      • You {settlement.debtor === address ? 'paid' : 'received'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white/30" />
                    </div>
                    <p className="text-white/70 text-lg">No payments yet</p>
                    <p className="text-white/50 text-sm mt-2">
                      Payment history will appear here once members settle their debts
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Not a Member Message */}
        {!isGroupMember && (
          <div className="text-center py-16">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 max-w-2xl mx-auto">
              <CardContent className="p-12">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Not a Member Yet</h3>
                <p className="text-white/70 text-lg mb-8">
                  You&apos;re not a member of this circle. Ask the circle keeper to add you as a member to participate in care sharing.
                </p>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm">
                    💡 Share this group ID with the creator: <br />
                    <span className="font-mono text-white/80 text-lg">#{groupId}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
