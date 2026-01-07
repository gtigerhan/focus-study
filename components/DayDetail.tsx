
import React from 'react';
import { DayLog, Subject } from '../types';
import { formatTime } from '../utils/formatters';

interface DayDetailProps {
  date: string;
  log?: DayLog;
  subjects: Subject[];
  onClose: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ date, log, subjects, onClose }) => {
  const displayDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const uniqueSubjectIdsInLog = Array.from(new Set(log?.sessions.map(s => s.subjectId) || []));
  
  const breakdown = uniqueSubjectIdsInLog.map(sid => {
    const subject = subjects.find(s => s.id === sid);
    const subjectSessions = log?.sessions.filter(sess => sess.subjectId === sid) || [];
    const duration = subjectSessions.reduce((acc, curr) => acc + curr.duration, 0);
    
    return {
      id: sid,
      name: subject?.name || 'Deleted Subject',
      color: subject?.color || '#333333',
      archived: subject?.archived || false,
      duration,
      sessions: subjectSessions
    };
  }).filter(s => s.duration > 0);

  const totalSeconds = breakdown.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
      <button 
        onClick={onClose}
        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="text-xs uppercase tracking-widest font-bold">Back to Calendar</span>
      </button>

      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 mb-6">
        <h2 className="text-xl font-semibold mb-1">{displayDate}</h2>
        <p className="text-zinc-500 text-sm mb-10">Total Study Time: <span className="text-white font-medium tabular-nums">{formatTime(totalSeconds)}</span></p>

        {breakdown.length > 0 ? (
          <div className="space-y-10">
            {/* Visual Bar */}
            <div className="h-3 w-full flex rounded-full overflow-hidden bg-zinc-800">
              {breakdown.map(s => (
                <div 
                  key={s.id}
                  style={{ 
                    width: `${(s.duration / totalSeconds) * 100}%`,
                    backgroundColor: s.color 
                  }}
                  className="h-full"
                />
              ))}
            </div>

            {/* List */}
            <div className="space-y-8">
              {breakdown.map(s => (
                <div key={s.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className={`font-medium ${s.archived ? 'text-zinc-500 italic' : ''}`}>
                        {s.name} {s.archived && '(Archived)'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="tabular-nums font-medium">{formatTime(s.duration)}</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                        {Math.round((s.duration / totalSeconds) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Sessions within this subject */}
                  <div className="pl-6 space-y-3">
                    {s.sessions.map(sess => (
                      <div key={sess.id} className="bg-white/5 rounded-xl p-3 border border-white/[0.03]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                            Session: {formatTime(sess.duration)}
                          </span>
                          <span className="text-[9px] text-zinc-600 tabular-nums">
                            {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {sess.memo && (
                          <p className="text-xs text-zinc-400 font-light leading-relaxed italic">
                            "{sess.memo}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-600 italic text-sm">
            No study sessions recorded for this day.
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetail;
