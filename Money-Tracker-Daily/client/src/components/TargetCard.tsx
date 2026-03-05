import React, { useState } from 'react';
import { useMonth } from '@/components/layout/MonthContext';
import { useMonthlyTarget, useSetMonthlyTarget, useTransactions } from '@/hooks/use-ledger';
import { Target, Pencil, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TargetCard() {
  const { monthString } = useMonth();
  const { data: targetData } = useMonthlyTarget(monthString);
  const { data: transactions } = useTransactions(monthString);
  const setTargetMutation = useSetMonthlyTarget();
  
  const [isOpen, setIsOpen] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const targetAmount = targetData?.targetAmount || 0;
  
  // Calculate total expenses for the month
  const totalExpense = transactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const isSuccess = targetAmount > 0 && totalExpense <= targetAmount;
  const isFail = targetAmount > 0 && totalExpense > targetAmount;
  
  const progressPercent = targetAmount > 0 ? Math.min((totalExpense / targetAmount) * 100, 100) : 0;

  const handleSave = () => {
    const amount = parseInt(targetInput.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(amount) && amount >= 0) {
      setTargetMutation.mutate({ month: monthString, targetAmount: amount }, {
        onSuccess: () => setIsOpen(false)
      });
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            이달의 목표 지출
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-foreground">
              {targetAmount > 0 ? `${formatMoney(targetAmount)}원` : '목표 설정하기'}
            </span>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button 
              className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              onClick={() => setTargetInput(targetAmount.toString())}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle>목표 지출 금액 설정</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="target">목표 금액 (원)</Label>
              <Input
                id="target"
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="mt-2 text-lg h-12 rounded-xl"
                placeholder="예: 500000"
              />
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSave} 
                disabled={setTargetMutation.isPending}
                className="w-full rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {setTargetMutation.isPending ? '저장 중...' : '저장하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {targetAmount > 0 && (
        <>
          <div className="mt-6 mb-2 flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">현재 지출: {formatMoney(totalExpense)}원</span>
            <span className={isFail ? "text-destructive" : "text-primary"}>
              {formatMoney(Math.abs(targetAmount - totalExpense))}원 {isFail ? '초과' : '남음'}
            </span>
          </div>
          
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isFail ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
             {isSuccess && (
               <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold animate-in fade-in zoom-in">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 SUCCESS
               </div>
             )}
             {isFail && (
               <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold animate-in fade-in zoom-in">
                 <AlertCircle className="w-3.5 h-3.5" />
                 FAIL
               </div>
             )}
          </div>
        </>
      )}
    </div>
  );
}
