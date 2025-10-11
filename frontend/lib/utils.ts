import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSTX(microStx: number, decimals = 6): string {
  try {
    const stx = microStx / 1000000;
    return stx.toFixed(decimals);
  } catch {
    return '0';
  }
}

export function parseSTX(value: string): number {
  try {
    return Math.floor(parseFloat(value) * 1000000);
  } catch {
    return 0;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

export function formatStacksAddress(address: string): string {
  if (!address) return '';
  // Stacks addresses are longer, so show more characters
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function isValidStacksAddress(address: string): boolean {
  // Basic Stacks address validation
  return address.length > 20 && (address.startsWith('SP') || address.startsWith('ST'));
}

export function microStxToStx(microStx: number): number {
  return microStx / 1000000;
}

export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * 1000000);
}

// Legacy compatibility - these will be phased out
export const formatETH = formatSTX;
export const parseETH = parseSTX;