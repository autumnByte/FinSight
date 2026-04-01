import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';
export type Category = 'salary' | 'freelance' | 'food' | 'transport' | 'entertainment' | 'shopping' | 'bills' | 'health' | 'travel' | 'investment' | 'other';
export type Role = 'admin' | 'viewer';
export type QuickFilter = 'all' | '7days' | '30days' | 'thisMonth';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  note?: string;
}

interface FiltersState {
  search: string;
  category: Category | 'all';
  type: TransactionType | 'all';
  quickFilter: QuickFilter;
  sortBy: 'date' | 'amount';
  sortDir: 'asc' | 'desc';
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modalOpen: boolean;
  editingTransaction: Transaction | null;
}

interface AppState {
  transactions: Transaction[];
  filters: FiltersState;
  role: Role;
  ui: UIState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilter: (f: Partial<FiltersState>) => void;
  setRole: (r: Role) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  openModal: (t?: Transaction) => void;
  closeModal: () => void;
}

const CATEGORIES: Category[] = ['salary', 'freelance', 'food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'travel', 'investment', 'other'];

function generateMockData(): Transaction[] {
  const descriptions: Record<Category, string[]> = {
    salary: ['Monthly Salary', 'Bonus Payment', 'Quarterly Review Bonus'],
    freelance: ['Web Design Project', 'Consulting Fee', 'Logo Design', 'App Development'],
    food: ['Whole Foods Market', 'Uber Eats Order', 'Starbucks Coffee', 'Restaurant Dinner', 'Grocery Run'],
    transport: ['Uber Ride', 'Gas Station', 'Metro Pass', 'Parking Fee'],
    entertainment: ['Netflix Subscription', 'Spotify Premium', 'Movie Tickets', 'Concert Tickets'],
    shopping: ['Amazon Order', 'Nike Store', 'Apple Store', 'IKEA Furniture'],
    bills: ['Electric Bill', 'Internet Service', 'Phone Bill', 'Water Bill', 'Rent Payment'],
    health: ['Gym Membership', 'Pharmacy', 'Doctor Visit', 'Vitamins'],
    travel: ['Flight Booking', 'Hotel Stay', 'Airbnb', 'Travel Insurance'],
    investment: ['Stock Purchase', 'Crypto Investment', 'Index Fund', 'Savings Deposit'],
    other: ['ATM Withdrawal', 'Gift Purchase', 'Charity Donation'],
  };

  const txns: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const descs = descriptions[cat];
    const desc = descs[Math.floor(Math.random() * descs.length)];
    const isIncome = cat === 'salary' || cat === 'freelance' || cat === 'investment' || Math.random() < 0.1;
    const amount = isIncome
      ? Math.round((Math.random() * 4000 + 500) * 100) / 100
      : Math.round((Math.random() * 300 + 5) * 100) / 100;

    txns.push({
      id: `txn-${i}-${Date.now()}`,
      description: desc,
      amount,
      type: isIncome ? 'income' : 'expense',
      category: cat,
      date: date.toISOString().split('T')[0],
    });
  }

  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: generateMockData(),
      filters: {
        search: '',
        category: 'all',
        type: 'all',
        quickFilter: 'all',
        sortBy: 'date',
        sortDir: 'desc',
      },
      role: 'admin',
      ui: {
        sidebarOpen: true,
        theme: 'dark',
        modalOpen: false,
        editingTransaction: null,
      },
      addTransaction: (t) =>
        set((s) => ({
          transactions: [{ ...t, id: `txn-${Date.now()}-${Math.random().toString(36).slice(2)}` }, ...s.transactions],
        })),
      updateTransaction: (id, updates) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      setFilter: (f) =>
        set((s) => ({ filters: { ...s.filters, ...f } })),
      setRole: (r) => set({ role: r }),
      toggleSidebar: () =>
        set((s) => ({ ui: { ...s.ui, sidebarOpen: !s.ui.sidebarOpen } })),
      toggleTheme: () =>
        set((s) => ({
          ui: { ...s.ui, theme: s.ui.theme === 'light' ? 'dark' : 'light' },
        })),
      openModal: (t) =>
        set((s) => ({ ui: { ...s.ui, modalOpen: true, editingTransaction: t || null } })),
      closeModal: () =>
        set((s) => ({ ui: { ...s.ui, modalOpen: false, editingTransaction: null } })),
    }),
    {
      name: 'finsight-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        ui: { ...state.ui, modalOpen: false, editingTransaction: null },
      }),
    }
  )
);
