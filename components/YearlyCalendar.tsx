
import React, { useState } from 'react';
import { DayLog } from '../types';
import { formatTime } from '../utils/formatters';

interface YearlyCalendarProps {
  logs: DayLog[];
  onDayClick: (date: string) => void;
}

const YearlyCalendar: React.FC<YearlyCalendarProps> = ({ logs, onDayClick }) => {
  const [viewYear, setViewYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const getDayTotal = (dateStr: string) => {
    const log = logs.find((l) => l.date === dateStr);
    if (!log) return 0;
    return log.sessions.reduce((acc, curr) => acc + curr.duration, 0);
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const getColorClass = (seconds: number) => {
    if (seconds === 0) return 'bg-zinc-900';
    if (seconds < 3600) return 'bg-zinc-700';
    if (seconds < 7200) return 'bg-zinc-500';
    if (seconds < 14400) return 'bg-zinc-300';
    return 'bg-white';
  };

  const renderMonthGrid = (monthIdx: number, size: 'small' | 'large' = 'small') => {
    const firstDay = new Date(viewYear, monthIdx, 1);
    const lastDay = new Date(viewYear, monthIdx + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`pad-${i}`} className={size === 'small' ? "h-2 w-2" : "h-10 w-10"} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${(monthIdx + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const total = getDayTotal(dateStr);
      
      if (size === 'small') {
        // Simple indicator square in the yearly view (not clickable)
        days.push(
          <div
            key={dateStr}
            className={`h-2 w-2 rounded-sm ${getColorClass(total)}`}
          />
        );
      } else {
        // Larger clickable target in the monthly detail view
        days.push(
          <button
            key={dateStr}
            onClick={(e) => {
              e.stopPropagation();
              onDayClick(dateStr);
            }}
            className={`h-10 w-10 text-xs rounded-sm transition-colors ${getColorClass(total)} flex items-center justify-center relative active:scale-90`}
          >
            <span className={total > 14400 ? 'text-black' : 'text-white/40'}>{d}</span>
          </button>
        );
      }
    }

    return (
      <div className={`grid grid-cols-7 ${size === 'small' ? 'gap-1' : 'gap-2'}`}>
        {size === 'large' && ['S','M','T','W','T','F','S'].map((day, i) => (
          <div key={i} className="h-10 w-10 flex items-center justify-center text-[10px] text-zinc-600 font-bold">{day}</div>
        ))}
        {days}
      </div>
    );
  };

  if (selectedMonth !== null) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedMonth(null)}
          className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-xs uppercase tracking-widest font-bold">Back to Year</span>
        </button>
        
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 mb-4">
          <h2 className="text-2xl font-semibold mb-6 tracking-tight">{months[selectedMonth]} {viewYear}</h2>
          <div className="flex justify-center">
            {renderMonthGrid(selectedMonth, 'large')}
          </div>
        </div>
        <p className="text-center text-zinc-600 text-[10px] uppercase tracking-widest mt-4 font-medium">Tap a day to see details</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => setViewYear(v => Math.max(2026, v - 1))} 
          className={`p-2 transition-transform active:scale-90 ${viewYear <= 2026 ? 'text-zinc-800' : 'text-zinc-500'}`}
          disabled={viewYear <= 2026}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold tabular-nums tracking-tight">{viewYear}</h2>
        <button onClick={() => setViewYear(v => v + 1)} className="p-2 text-zinc-500 active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {months.map((name, i) => (
          <div 
            key={i} 
            className="mb-4 cursor-pointer group"
            onClick={() => setSelectedMonth(i)}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[9px] text-zinc-600 group-hover:text-white uppercase font-bold tracking-tight transition-colors">
                {name}
              </h4>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2 h-2 text-zinc-800 group-hover:text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            {renderMonthGrid(i, 'small')}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-sm bg-zinc-900"></div>
          <div className="w-2 h-2 rounded-sm bg-zinc-700"></div>
          <div className="w-2 h-2 rounded-sm bg-zinc-500"></div>
          <div className="w-2 h-2 rounded-sm bg-zinc-300"></div>
          <div className="w-2 h-2 rounded-sm bg-white"></div>
        </div>
        <span>More</span>
      </div>
      <p className="text-center text-zinc-700 text-[8px] uppercase tracking-widest mt-6">Tap a month to zoom in</p>
    </div>
  );
};

export default YearlyCalendar;
