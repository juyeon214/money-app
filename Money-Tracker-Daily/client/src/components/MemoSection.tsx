import React, { useState } from 'react';
import { useMonth } from '@/components/layout/MonthContext';
import { useMemos, useCreateMemo, useUpdateMemo, useDeleteMemo } from '@/hooks/use-ledger';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function MemoSection() {
  const { monthString } = useMonth();
  const { data: memos } = useMemos(monthString);
  const createMemo = useCreateMemo();
  const updateMemo = useUpdateMemo();
  const deleteMemo = useDeleteMemo();

  const [newMemo, setNewMemo] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemo.trim()) return;
    createMemo.mutate({ month: monthString, content: newMemo.trim(), isCompleted: false }, {
      onSuccess: () => setNewMemo('')
    });
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">이벤트 지출 메모</h3>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <Input 
          value={newMemo}
          onChange={(e) => setNewMemo(e.target.value)}
          placeholder="이번 달 특별한 지출 일정을 적어보세요"
          className="rounded-xl border-none bg-secondary/50 focus-visible:ring-primary/20 h-10 text-sm"
        />
        <button 
          type="submit"
          disabled={!newMemo.trim() || createMemo.isPending}
          className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-1">
        {memos?.length === 0 && (
          <p className="text-xs text-center text-muted-foreground py-4">등록된 메모가 없습니다.</p>
        )}
        {memos?.map(memo => (
          <div key={memo.id} className="flex items-center justify-between p-2 hover:bg-secondary/30 rounded-xl group transition-colors">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => updateMemo.mutate({ id: memo.id, isCompleted: !memo.isCompleted })}
            >
              {memo.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm ${memo.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {memo.content}
              </span>
            </div>
            <button 
              onClick={() => deleteMemo.mutate(memo.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
