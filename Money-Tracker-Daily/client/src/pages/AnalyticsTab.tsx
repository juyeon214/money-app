import React, { useMemo } from 'react';
import { useMonth } from '@/components/layout/MonthContext';
import { useTransactions } from '@/hooks/use-ledger';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const COLORS = ['#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function AnalyticsTab() {
  const { monthString } = useMonth();
  const { data: transactions, isLoading } = useTransactions(monthString);

  const stats = useMemo(() => {
    if (!transactions) return { expense: 0, income: 0, categoryData: [] };

    let totalExpense = 0;
    let totalIncome = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      } else {
        totalIncome += t.amount;
      }
    });

    const categoryData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { expense: totalExpense, income: totalIncome, categoryData };
  }, [transactions]);

  const formatMoney = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">데이터를 불러오는 중...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-destructive/5 rounded-full blur-xl" />
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
            <TrendingDown className="w-4 h-4 text-destructive" /> 지출
          </div>
          <div className="text-xl font-bold font-display text-foreground">
            {formatMoney(stats.expense)}원
          </div>
        </div>
        <div className="glass-card rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
            <TrendingUp className="w-4 h-4 text-blue-500" /> 수입
          </div>
          <div className="text-xl font-bold font-display text-foreground">
            {formatMoney(stats.income)}원
          </div>
        </div>
      </div>

      {/* Categories Pie Chart */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-base font-bold mb-6">카테고리별 지출 비율</h3>
        {stats.categoryData.length > 0 ? (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${formatMoney(value)}원`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex flex-col gap-3">
              {stats.categoryData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{Math.round((cat.value / stats.expense) * 100)}%</span>
                    <span className="font-bold w-20 text-right">{formatMoney(cat.value)}원</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
            <PieChart className="w-12 h-12 mb-2" />
            <p>이번 달 지출 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* Monthly Analysis Note */}
      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-primary mb-1">월 소비 분석</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stats.expense === 0 
              ? "아직 소비 내역이 없습니다. 가계부를 꼼꼼히 기록해보세요!" 
              : stats.categoryData.length > 0
                ? `이번 달은 [${stats.categoryData[0].name}] 카테고리에서 가장 많은 지출이 발생했습니다. 남은 기간 동안 예산 관리에 유의하세요.`
                : "지출 패턴을 분석 중입니다."}
          </p>
        </div>
      </div>
    </div>
  );
}
