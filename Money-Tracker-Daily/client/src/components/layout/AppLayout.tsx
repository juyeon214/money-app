import React from 'react';
import { Link, useLocation } from 'wouter';
import { CalendarDays, PieChart, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '@/components/layout/MonthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentDate, nextMonth, prevMonth } = useMonth();

  const navItems = [
    { href: '/', icon: CalendarDays, label: '달력' },
    { href: '/analytics', icon: PieChart, label: '통계' },
    { href: '/list', icon: List, label: '내역' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[80px] max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass px-4 py-4 flex items-center justify-between rounded-b-3xl">
        <button 
          onClick={prevMonth}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        
        <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-1">
          {format(currentDate, 'yyyy년 M월', { locale: ko })}
        </h1>
        
        <button 
          onClick={nextMonth}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-3xl max-w-md mx-auto border-t border-border">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground hover:scale-105"
                )}>
                  <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* iOS Home Indicator Safe Area */}
        <div className="h-6 w-full" />
      </nav>
    </div>
  );
}
