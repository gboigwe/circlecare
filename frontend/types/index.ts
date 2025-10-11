export interface Expense {
  id: bigint;
  description: string;
  totalAmount: bigint;
  paidBy: string;
  participants: string[];
  shares: bigint[];
  settled: boolean;
  timestamp: bigint;
  receiptHash: string;
}

export interface Member {
  wallet: string;
  nickname: string;
  totalOwed: bigint;
  totalOwing: bigint;
  active: boolean;
}

export interface GroupInfo {
  groupAddress: string;
  name: string;
  creator: string;
  createdAt: bigint;
  active: boolean;
}

export interface GroupData {
  info: GroupInfo;
  members: Member[];
  expenses: Expense[];
  memberCount: number;
  expenseCount: number;
}

export interface Balance {
  member: string;
  balance: bigint; // positive = owed money, negative = owes money
}

export interface DebtInfo {
  creditor: string;
  amount: bigint;
  creditorNickname?: string;
}