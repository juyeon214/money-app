import React, { useState } from 'react';
import { useMonth } from '@/components/layout/MonthContext';
import { useTransactions, useDeleteTransaction } from '@/hooks/use-ledger';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Trash2, ReceiptText, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ListTab() {
  const { monthString } = useMonth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use debounced search internally via react-query if needed, but simple filtering is fine for small datasets
  // We'll pass the query to the API for real searching as requested by the schema
  const { data: transactions, isLoading } = useTransactions(monthString, searchQuery);
  const deleteTx = useDeleteTransaction();

  const handleDelete = (id: number) => {
    if (confirm('이 내역을 삭제하시겠습니까?')) {
      deleteTx.mutate(id);
    }
  };

  // Group transactions by date
  const groupedTransactions = transactions?.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, typeof transactions>) || {};

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatMoney = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="내역 검색하기..."
          className="pl-12 h-12 rounded-2xl bg-white shadow-sm border-none focus-visible:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground animate-pulse">불러오는 중...</div>
      ) : sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
          <ReceiptText className="w-16 h-16 mb-4 stroke-[1.5px]" />
          <p>표시할 내역이 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-4">
          {sortedDates.map(date => {
            const dayTxs = groupedTransactions[date];
            const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

            return (
              <div key={date} className="glass-card rounded-3xl overflow-hidden">
                <div className="bg-secondary/40 px-5 py-3 border-b border-border/50 flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">
                    {format(parseISO(date), 'M월 d일 eeee', { locale: ko })}
                  </span>
                  <div className="flex gap-3 text-xs font-semibold font-display">
                    {dayIncome > 0 && <span className="text-blue-500">+{formatMoney(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-destructive">-{formatMoney(dayExpense)}</span>}
                  </div>
                </div>
                
                <div className="divide-y divide-border/30">
                  {dayTxs.map(tx => (
                    <div key={tx.id} className="p-5 flex items-center justify-between group hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          tx.type === 'income' ? 'bg-blue-50 text-blue-600' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {tx.category.slice(0, 2)}
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">{tx.description}</span>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>{tx.category}</span>
                            {tx.isFixed && <span className="bg-secondary px-1.5 py-0.5 rounded text-foreground">고정</span>}
                            {tx.splitCount > 1 && (
                              <span className="flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                <Users className="w-3 h-3" /> 1/{tx.splitCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                        <span className={`font-bold font-display ${tx.type === 'income' ? 'text-blue-500' : 'text-foreground'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}원
                        </span>
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
