import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, Transaction, Category, TransactionType } from '@/stores/useStore';
import { formatCurrency, categoryConfig, filterByQuickFilter, exportToCSV } from '@/lib/helpers';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Search, Filter, Download, Plus, X, Trash2, Edit2, ChevronUp, ChevronDown, Inbox,
} from 'lucide-react';

const CATEGORIES: Category[] = ['salary', 'freelance', 'food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'travel', 'investment', 'other'];
const QUICK_FILTERS = [
  { label: 'All Time', value: 'all' as const },
  { label: 'Last 7 Days', value: '7days' as const },
  { label: 'Last 30 Days', value: '30days' as const },
  { label: 'This Month', value: 'thisMonth' as const },
];

function TransactionModal() {
  const { ui, closeModal, addTransaction, updateTransaction } = useStore();
  const editing = ui.editingTransaction;

  const [form, setForm] = useState({
    description: editing?.description || '',
    amount: editing?.amount?.toString() || '',
    type: editing?.type || 'expense' as TransactionType,
    category: editing?.category || 'food' as Category,
    date: editing?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, amount: parseFloat(form.amount) };
    if (editing) {
      updateTransaction(editing.id, data);
    } else {
      addTransaction(data);
    }
    closeModal();
  };

  return (
    <AnimatePresence>
      {ui.modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">{editing ? 'Edit' : 'Add'} Transaction</h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <input
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                  <input
                    required type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{categoryConfig[c].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm"
              >
                {editing ? 'Update' : 'Add'} Transaction
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TransactionsPage() {
  const { transactions, filters, setFilter, role, openModal, deleteTransaction } = useStore();
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  const handleSearch = useCallback((val: string) => {
    setSearchInput(val);
    const timeout = setTimeout(() => setFilter({ search: val }), 300);
    return () => clearTimeout(timeout);
  }, [setFilter]);

  const filtered = useMemo(() => {
    let txns = [...transactions];
    txns = filterByQuickFilter(txns, filters.quickFilter);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      txns = txns.filter((t) => t.description.toLowerCase().includes(q) || t.category.includes(q));
    }
    if (filters.category !== 'all') txns = txns.filter((t) => t.category === filters.category);
    if (filters.type !== 'all') txns = txns.filter((t) => t.type === filters.type);
    txns.sort((a, b) => {
      const mul = filters.sortDir === 'asc' ? 1 : -1;
      if (filters.sortBy === 'date') return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });
    return txns;
  }, [transactions, filters]);

  const toggleSort = (by: 'date' | 'amount') => {
    if (filters.sortBy === by) setFilter({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' });
    else setFilter({ sortBy: by, sortDir: 'desc' });
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (filters.sortBy !== col) return null;
    return filters.sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const isAdmin = role === 'admin';

  return (
    <DashboardLayout>
      <TransactionModal />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground text-sm">{filtered.length} transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => exportToCSV(filtered)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download size={16} /> Export
            </motion.button>
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
              >
                <Plus size={16} /> Add
              </motion.button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((qf) => (
            <button
              key={qf.value}
              onClick={() => setFilter({ quickFilter: qf.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.quickFilter === qf.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {qf.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilter({ category: e.target.value as any })}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{categoryConfig[c].label}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilter({ type: e.target.value as any })}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-12 text-center">
            <Inbox size={48} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No transactions found</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your filters or add a new transaction</p>
          </motion.div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort('date')}
                    >
                      <span className="flex items-center gap-1">Date <SortIcon col="date" /></span>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort('amount')}
                    >
                      <span className="flex items-center gap-1 justify-end">Amount <SortIcon col="amount" /></span>
                    </th>
                    {isAdmin && <th className="py-3 px-4 w-20" />}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((txn, i) => {
                      const cat = categoryConfig[txn.category];
                      const Icon = cat.icon;
                      return (
                        <motion.tr
                          key={txn.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '18' }}>
                                <Icon size={14} style={{ color: cat.color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">{txn.description}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{cat.label}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                              {cat.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${txn.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                          {isAdmin && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(txn)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteTransaction(txn.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
