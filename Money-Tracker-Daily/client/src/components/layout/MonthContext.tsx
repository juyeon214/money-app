import React, { createContext, useContext, useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';

interface MonthContextType {
  currentDate: Date;
  monthString: string; // YYYY-MM
  nextMonth: () => void;
  prevMonth: () => void;
  setMonth: (date: Date) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthString = format(currentDate, 'yyyy-MM');
  
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const setMonth = (date: Date) => setCurrentDate(date);

  return (
    <MonthContext.Provider value={{ currentDate, monthString, nextMonth, prevMonth, setMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
