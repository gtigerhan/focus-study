
import React from 'react';
import { DayLog } from '../types';
import { getTodayKey } from '../utils/formatters';

interface StudyCalendarProps {
  logs: DayLog[];
  onDayClick?: (date: string) => void;
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ logs, onDayClick }) => {
  // Use South Korea Time for the "Today" reference
  const todayKST = getTodayKey();
  
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    // Use the Seoul relative date for the end of the range
    const seoulTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul'
    }).format(new Date());
    
    const rangeEndDate = new Date(seoulTime);
    rangeEndDate.setDate(rangeEndDate.getDate() - (13 - i));
    return rangeEndDate.toISOString().split('T')[0];
  });

  const getDayTotal = (date: string) => {
    const log = logs.find((l) => l.date === date);
    if (!log) return 0;
    return log.sessions.reduce((acc, curr) => acc + curr.duration, 0);
  };

  const getMaxSeconds = () => {
    const totals = days.map(getDayTotal);
    return Math.max(...totals, 3600);
  };

  const maxSeconds = getMaxSeconds();

  return (
    <div className="mb-10 bg-zinc-900/20 border border-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-500 uppercase text-[10px] tracking-widest font-bold">Activity (14d)</h3>
      </div>
      <div className="flex items-end justify-between h-24 gap-1 px-1">
        {days.map((date) => {
          const total = getDayTotal(date);
          const heightPercent = Math.min((total / maxSeconds) * 100, 100);
          const isToday = date === todayKST;
          
          return (
            <button 
              key={date} 
              onClick={() => onDayClick?.(date)}
              className="flex-1 flex flex-col items-center outline-none"
            >
              <div 
                className={`w-full rounded-t-sm transition-all duration-300 ease-out ${
                  isToday ? 'bg-white' : total > 0 ? 'bg-zinc-500' : 'bg-zinc-800'
                }`}
                style={{ height: `${Math.max(heightPercent, 6)}%` }}
              />
              
              <div className={`mt-2 text-[8px] font-bold ${isToday ? 'text-white' : 'text-zinc-600'}`}>
                {date.split('-')[2]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudyCalendar;
