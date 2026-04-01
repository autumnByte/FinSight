import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { formatCurrency, categoryConfig } from '@/lib/helpers';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function InsightsPage() {
  const { transactions } = useStore();

  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthTxns = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const thisExpenses = thisMonthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastExpenses = lastMonthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const thisIncome = thisMonthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const expenseChange = lastExpenses > 0 ? ((thisExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    const incomeChange = lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome) * 100 : 0;

    // Top category
    const catTotals: Record<string, number> = {};
    thisMonthTxns.filter((t) => t.type === 'expense').forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    // Monthly comparison data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(thisYear, thisMonth - i, 1);
      const month = m.getMonth();
      const year = m.getFullYear();
      const monthTxns = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      monthlyData.push({
        month: m.toLocaleDateString('en-US', { month: 'short' }),
        income: monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }

    return {
      thisExpenses, lastExpenses, thisIncome, lastIncome,
      expenseChange, incomeChange,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      monthlyData,
      savingsRate: thisIncome > 0 ? ((thisIncome - thisExpenses) / thisIncome) * 100 : 0,
    };
  }, [transactions]);

  const insightCards = [
    {
      title: 'Spending Trend',
      icon: insights.expenseChange > 0 ? TrendingUp : TrendingDown,
      value: `${Math.abs(insights.expenseChange).toFixed(1)}%`,
      subtitle: `${insights.expenseChange > 0 ? 'More' : 'Less'} than last month`,
      color: insights.expenseChange > 0 ? 'text-destructive' : 'text-success',
      bg: insights.expenseChange > 0 ? 'from-destructive/10 to-destructive/5' : 'from-success/10 to-success/5',
    },
    {
      title: 'Income Change',
      icon: insights.incomeChange >= 0 ? TrendingUp : TrendingDown,
      value: `${Math.abs(insights.incomeChange).toFixed(1)}%`,
      subtitle: `${insights.incomeChange >= 0 ? 'Increase' : 'Decrease'} vs last month`,
      color: insights.incomeChange >= 0 ? 'text-success' : 'text-destructive',
      bg: insights.incomeChange >= 0 ? 'from-success/10 to-success/5' : 'from-destructive/10 to-destructive/5',
    },
    {
      title: 'Savings Rate',
      icon: Sparkles,
      value: `${insights.savingsRate.toFixed(1)}%`,
      subtitle: 'Of income saved this month',
      color: insights.savingsRate >= 20 ? 'text-success' : 'text-warning',
      bg: insights.savingsRate >= 20 ? 'from-success/10 to-primary/5' : 'from-warning/10 to-warning/5',
    },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground text-sm">Smart analysis of your finances</p>
        </motion.div>

        {/* Insight Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insightCards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              className={`glass-card-hover rounded-xl p-5 bg-gradient-to-br ${card.bg}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={18} className={card.color} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Top Spending Category */}
        {insights.topCategory && (
          <motion.div variants={item} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <AlertCircle size={20} className="text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Highest Spending Category</p>
                <p className="text-xs text-muted-foreground">
                  You spent <span className="font-semibold text-foreground">{formatCurrency(insights.topCategory.amount)}</span> on{' '}
                  <span className="font-semibold text-foreground">
                    {categoryConfig[insights.topCategory.name as keyof typeof categoryConfig]?.label || insights.topCategory.name}
                  </span>{' '}
                  this month
                </p>
              </div>
              <ArrowRight size={18} className="text-muted-foreground" />
            </div>
          </motion.div>
        )}

        {/* Monthly Comparison Chart */}
        <motion.div variants={item} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: 12,
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`]}
              />
              <Bar dataKey="income" fill="hsl(152, 69%, 41%)" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Smart Summary */}
        <motion.div variants={item} className="glass-card rounded-xl p-5 border-l-4 border-l-primary">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Smart Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.savingsRate >= 20
                  ? `Great job! You're saving ${insights.savingsRate.toFixed(0)}% of your income this month. Keep up the good work.`
                  : insights.savingsRate >= 0
                  ? `You're saving ${insights.savingsRate.toFixed(0)}% of your income. Consider reducing spending in your top category to improve.`
                  : `You're spending more than you earn this month. Review your expenses and look for areas to cut back.`
                }
                {insights.expenseChange > 10 && ` Your expenses increased by ${insights.expenseChange.toFixed(0)}% compared to last month — worth keeping an eye on.`}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
