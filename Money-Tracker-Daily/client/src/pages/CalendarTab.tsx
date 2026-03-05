import React from 'react';
import { TargetCard } from '@/components/TargetCard';
import { MemoSection } from '@/components/MemoSection';
import { CustomCalendar } from '@/components/CustomCalendar';

export function CalendarTab() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TargetCard />
      <CustomCalendar />
      <MemoSection />
    </div>
  );
}
