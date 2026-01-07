
import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/formatters';

interface TimerProps {
  onFinish: (seconds: number, memo?: string) => void;
  subjectName: string;
  onCancel: () => void;
}

const Timer: React.FC<TimerProps> = ({ onFinish, subjectName, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [memo, setMemo] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-2">Studying</div>
      <h2 className="text-2xl font-light mb-8">{subjectName}</h2>
      
      <div className="text-7xl font-light tabular-nums mb-12 tracking-tighter">
        {formatTime(seconds)}
      </div>

      <div className="w-full max-w-xs mb-12">
        <label className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 block font-bold">Session Memo (Optional)</label>
        <textarea
          placeholder="What are you working on?"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/20 transition-all resize-none h-24 placeholder:text-zinc-700"
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <div className="flex gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-4 rounded-full border border-white/10 transition-all font-medium ${
              isActive ? 'bg-white/5 text-zinc-400' : 'bg-zinc-800 text-white'
            }`}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={() => onFinish(seconds, memo)}
            className="flex-[1.5] py-4 rounded-full bg-white text-black font-bold active:scale-95 transition-transform"
          >
            Complete
          </button>
        </div>

        <button
          onClick={onCancel}
          className="py-2 text-zinc-600 text-xs uppercase tracking-widest font-bold mt-4"
        >
          Discard Session
        </button>
      </div>
    </div>
  );
};

export default Timer;
