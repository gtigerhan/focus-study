
import React from 'react';
import { Subject } from '../types';
import { formatTime } from '../utils/formatters';

interface SubjectCardProps {
  subject: Subject;
  totalTime: number;
  onStart: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, totalTime, onStart, onDelete }) => {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 mb-4 flex items-center justify-between group">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: subject.color }} 
          />
          <h3 className="text-lg font-medium">{subject.name}</h3>
        </div>
        <p className="text-zinc-500 text-sm font-light">
          Today: <span className="text-zinc-300 tabular-nums">{formatTime(totalTime)}</span>
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => onStart(subject)}
          className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(subject.id)}
          className="p-2 text-zinc-700 hover:text-red-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
