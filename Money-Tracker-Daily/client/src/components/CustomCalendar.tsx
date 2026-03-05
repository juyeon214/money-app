import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMonth } from '@/components/layout/MonthContext';
import { useTransactions } from '@/hooks/use-ledger';
import { TransactionDialog } from './TransactionDialog';

export function CustomCalendar() {
  const { currentDate, monthString } = useMonth();
  const { data: transactions } = useTransactions(monthString);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);
  };

  return (
    <div className="glass-card rounded-3xl p-4">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, i) => (
          <div key={day} className={`text-center text-xs font-bold py-2 ${i === 0 ? 'text-destructive' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2">
        {days.map((day, idx) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayTransactions = transactions?.filter(t => t.date === formattedDate) || [];
          
          const hasIncome = dayTransactions.some(t => t.type === 'income');
          const hasExpense = dayTransactions.some(t => t.type === 'expense');

          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toString()} 
              onClick={() => handleDayClick(day)}
              className={`
                relative flex flex-col items-center justify-start py-2 h-14 cursor-pointer rounded-2xl transition-all
                ${!isCurrentMonth ? 'opacity-30' : 'hover:bg-secondary/50'}
              `}
            >
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                ${isDayToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground'}
                ${!isDayToday && idx % 7 === 0 ? 'text-destructive' : ''}
                ${!isDayToday && idx % 7 === 6 ? 'text-blue-500' : ''}
              `}>
                {format(day, dateFormat)}
              </div>
              
              {/* Dots for transactions */}
              <div className="flex gap-1 mt-1">
                {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-destructive" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <TransactionDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          selectedDate={selectedDate} 
        />
      )}
    </div>
  );
}
