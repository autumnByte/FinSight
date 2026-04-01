import { Transaction, Category, QuickFilter } from '@/stores/useStore';
import {
  Banknote, Briefcase, UtensilsCrossed, Car, Gamepad2, ShoppingBag,
  Receipt, HeartPulse, Plane, TrendingUp, MoreHorizontal
} from 'lucide-react';

export const categoryConfig: Record<Category, { label: string; icon: typeof Banknote; color: string }> = {
  salary: { label: 'Salary', icon: Banknote, color: 'hsl(152, 69%, 41%)' },
  freelance: { label: 'Freelance', icon: Briefcase, color: 'hsl(168, 80%, 36%)' },
  food: { label: 'Food', icon: UtensilsCrossed, color: 'hsl(38, 92%, 50%)' },
  transport: { label: 'Transport', icon: Car, color: 'hsl(210, 70%, 50%)' },
  entertainment: { label: 'Entertainment', icon: Gamepad2, color: 'hsl(262, 83%, 58%)' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: 'hsl(340, 75%, 55%)' },
  bills: { label: 'Bills', icon: Receipt, color: 'hsl(200, 50%, 45%)' },
  health: { label: 'Health', icon: HeartPulse, color: 'hsl(0, 72%, 51%)' },
  travel: { label: 'Travel', icon: Plane, color: 'hsl(280, 60%, 55%)' },
  investment: { label: 'Investment', icon: TrendingUp, color: 'hsl(120, 50%, 45%)' },
  other: { label: 'Other', icon: MoreHorizontal, color: 'hsl(220, 10%, 50%)' },
};

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function filterByQuickFilter(txns: Transaction[], qf: QuickFilter): Transaction[] {
  if (qf === 'all') return txns;
  const now = new Date();
  const cutoff = new Date();
  if (qf === '7days') cutoff.setDate(now.getDate() - 7);
  else if (qf === '30days') cutoff.setDate(now.getDate() - 30);
  else {
    cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
  }
  return txns.filter((t) => new Date(t.date) >= cutoff);
}

export function exportToCSV(txns: Transaction[]): void {
  const header = 'Date,Description,Category,Type,Amount\n';
  const rows = txns
    .map((t) => `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finsight-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
