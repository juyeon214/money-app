import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { useCreateTransaction } from '@/hooks/use-ledger';

const EXPENSE_CATEGORIES = ['식비', '교통', '문화/여가', '생활', '주거/통신', '이벤트', '기타'];
const INCOME_CATEGORIES = ['급여', '용돈', '부수입', '기타'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export function TransactionDialog({ isOpen, onClose, selectedDate }: Props) {
  const createTx = useCreateTransaction();
  
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [isFixed, setIsFixed] = useState(false);
  const [splitCount, setSplitCount] = useState('1');

  // Reset form when opened or type changes
  useEffect(() => {
    if (isOpen) {
      setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    }
  }, [type, isOpen]);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  const numTotal = parseInt(totalAmount.replace(/[^0-9]/g, ''), 10) || 0;
  const numSplit = Math.max(1, parseInt(splitCount, 10) || 1);
  const finalAmount = Math.round(numTotal / numSplit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numTotal <= 0 || !description) return;

    createTx.mutate({
      type,
      amount: finalAmount, // Save the finalized (split) amount
      date: format(selectedDate, 'yyyy-MM-dd'),
      description,
      category,
      isFixed,
      splitCount: numSplit
    }, {
      onSuccess: () => {
        onClose();
        // reset form
        setTotalAmount('');
        setDescription('');
        setSplitCount('1');
        setIsFixed(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden bg-card border-none shadow-2xl">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">내역 추가</DialogTitle>
            <DialogDescription>
              {format(selectedDate, 'yyyy년 MM월 dd일')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 flex flex-col gap-5">
          {/* Type Toggle */}
          <div className="flex p-1 bg-secondary/50 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'expense' ? 'bg-white shadow-sm text-destructive' : 'text-muted-foreground'}`}
              onClick={() => setType('expense')}
            >
              지출
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'income' ? 'bg-white shadow-sm text-blue-500' : 'text-muted-foreground'}`}
              onClick={() => setType('income')}
            >
              수입
            </button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">금액 (총액)</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  className="pl-4 pr-10 h-12 text-lg font-bold font-display rounded-xl"
                  placeholder="0"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">원</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">내역</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="무엇을 위해 쓰셨나요?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">카테고리</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      category === cat 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {type === 'expense' && (
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">고정 지출</Label>
                  <p className="text-[10px] text-muted-foreground">매월 반복되는 지출인가요?</p>
                </div>
                <Switch checked={isFixed} onCheckedChange={setIsFixed} />
              </div>
            )}

            {type === 'expense' && (
              <div className="space-y-2 p-3 bg-secondary/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">1/N 정산 (더치페이)</Label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSplitCount(Math.max(1, numSplit - 1).toString())} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-primary shadow-sm font-bold">-</button>
                    <span className="w-4 text-center font-bold text-sm">{numSplit}</span>
                    <button type="button" onClick={() => setSplitCount((numSplit + 1).toString())} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-primary shadow-sm font-bold">+</button>
                  </div>
                </div>
                {numSplit > 1 && (
                  <div className="pt-2 mt-2 border-t border-border/50 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">나의 실제 부담액</span>
                    <span className="font-bold text-primary">{new Intl.NumberFormat('ko-KR').format(finalAmount)}원</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={createTx.isPending || numTotal <= 0 || !description}
            className="w-full h-14 text-base font-bold rounded-xl mt-2 bg-foreground text-background hover:bg-foreground/90 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            {createTx.isPending ? '저장 중...' : '저장하기'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
