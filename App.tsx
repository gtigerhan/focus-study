import React, { useState, useEffect, useRef } from 'react';
import { Subject, StudySession, DayLog } from './types.js';
import { getTodayKey, formatTime } from './utils/formatters.js';
import Timer from './components/Timer.js';
import SubjectCard from './components/SubjectCard.js';
import StudyCalendar from './components/StudyCalendar.js';
import YearlyCalendar from './components/YearlyCalendar.js';
import DayDetail from './components/DayDetail.js';

const COLORS = ['#FF5F5F', '#5FFF95', '#5F9FFF', '#D45FFF', '#FFD45F', '#5FFFFF', '#FF9F5F', '#FFFFFF'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'focus' | 'history'>('focus');
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('zen_subjects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Focus Session', color: COLORS[2], archived: false }
    ];
  });

  const [logs, setLogs] = useState<DayLog[]>(() => {
    const saved = localStorage.getItem('zen_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastBackup, setLastBackup] = useState<string>(() => localStorage.getItem('zen_last_backup') || 'Never');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zen_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('zen_logs', JSON.stringify(logs));
  }, [logs]);

  const exportData = () => {
    const data = { 
      subjects, 
      logs, 
      version: "1.1", 
      exportedAt: new Date().toISOString(),
      timezone: "Asia/Seoul" 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenStudy_Backup_${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    const nowStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setLastBackup(nowStr);
    localStorage.setItem('zen_last_backup', nowStr);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.subjects && json.logs) {
          if (confirm("Restore " + json.logs.length + " days of data? This will overwrite current data.")) {
            setSubjects(json.subjects);
            setLogs(json.logs);
            setShowDatabase(false);
          }
        }
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    setSubjects([...subjects, { id: Date.now().toString(), name: newSubjectName.trim(), color: selectedColor, archived: false }]);
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const completeSession = (duration: number, memo?: string) => {
    if (!activeSubject || duration < 1) { setActiveSubject(null); return; }
    const today = getTodayKey();
    const newSession: StudySession = { id: Date.now().toString(), subjectId: activeSubject.id, duration, timestamp: Date.now(), memo };
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === today);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], sessions: [...next[idx].sessions, newSession] };
        return next;
      }
      return [...prev, { date: today, sessions: [newSession] }];
    });
    setActiveSubject(null);
  };

  const getTodayTime = () => {
    const log = logs.find(l => l.date === getTodayKey());
    return log ? log.sessions.reduce((acc, s) => acc + s.duration, 0) : 0;
  };

  const activeSubjects = subjects.filter(s => !s.archived);

  return (
    <div className="h-full flex flex-col font-light bg-black">
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importData} />

      <main className="flex-1 overflow-y-auto px-6 pt-12 pb-48 safe-top">
        {activeTab === 'focus' ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <header className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-semibold mb-1 tracking-tighter">Focus</h1>
                <p className="text-zinc-500 text-sm font-medium">Daily Goal · <span className="text-white tabular-nums">{formatTime(getTodayTime())}</span></p>
              </div>
              <button 
                onClick={() => setShowDatabase(true)} 
                className="p-3 bg-zinc-900/50 rounded-2xl text-zinc-400 active:scale-90 transition-transform relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75" />
                </svg>
              </button>
            </header>

            <StudyCalendar logs={logs} onDayClick={(d) => { setSelectedDateDetail(d); setActiveTab('history'); }} />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-zinc-600 uppercase text-[10px] tracking-[0.2em] font-bold">Your Subjects</h2>
              <div className="flex gap-1">
                <button onClick={() => setShowArchive(true)} className="p-2 text-zinc-600 active:text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                </button>
                <button onClick={() => setIsAddingSubject(true)} className="p-2 text-zinc-400 active:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activeSubjects.map(s => (
                <SubjectCard 
                  key={s.id} 
                  subject={s} 
                  totalTime={logs.find(l => l.date === getTodayKey())?.sessions.filter(sess => sess.subjectId === s.id).reduce((a, b) => a + b.duration, 0) || 0}
                  onStart={setActiveSubject}
                  onDelete={(id) => setSubjects(subjects.map(x => x.id === id ? {...x, archived: true} : x))}
                />
              ))}
              {/* Spacer to ensure scrolling past the navigation bar */}
              <div className="h-20" />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-semibold mb-8 tracking-tighter">History</h1>
            {selectedDateDetail ? (
              <DayDetail date={selectedDateDetail} log={logs.find(l => l.date === selectedDateDetail)} subjects={subjects} onClose={() => setSelectedDateDetail(null)} />
            ) : (
              <YearlyCalendar logs={logs} onDayClick={setSelectedDateDetail} />
            )}
            <div className="h-24" />
          </div>
        )}
      </main>

      {/* Navigation */}
      {!activeSubject && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-10 pb-12 pt-4 z-40 safe-bottom">
          <button 
            onClick={() => { setActiveTab('focus'); setSelectedDateDetail(null); }} 
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'focus' ? 'text-white' : 'text-zinc-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18.75a.75.75 0 0 1 .75.75V21.75a.75.75 0 0 1-1.5 0V19.5a.75.75 0 0 1 .75-.75ZM5.106 17.834a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 0 0-1.06-1.061l-1.591 1.59ZM3 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm3.166-6.894a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 0 0 1.061-1.06l-1.59-1.591Z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Focus</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-white' : 'text-zinc-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path fillRule="evenodd" d="M6 3.75a3 3 0 0 0-3 3v13.5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-1.5V2.25a.75.75 0 0 0-1.5 0v1.5h-9V2.25a.75.75 0 0 0-1.5 0v1.5H6ZM4.5 7.5v12.75c0 .828.672 1.5 1.5 1.5h12c.828 0 1.5-.672 1.5-1.5V7.5H4.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">History</span>
          </button>
        </nav>
      )}

      {/* Database Modal */}
      {showDatabase && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-10 safe-top safe-bottom">
          <header className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-bold">Settings</h3>
            <button onClick={() => setShowDatabase(false)} className="text-zinc-500">Close</button>
          </header>
          <div className="space-y-8">
            <button onClick={exportData} className="w-full bg-white text-black py-4 rounded-2xl font-bold">Export Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full border border-white/20 py-4 rounded-2xl font-bold">Import Backup</button>
            <p className="text-[10px] text-center text-zinc-600 uppercase tracking-widest">Last Backup: {lastBackup}</p>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchive && (
        <div className="fixed inset-0 bg-black z-50 p-10 flex flex-col safe-top">
          <header className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Archive</h3>
            <button onClick={() => setShowArchive(false)} className="text-zinc-500">Done</button>
          </header>
          <div className="flex-1 overflow-y-auto space-y-4 pb-20">
            {subjects.filter(s => s.archived).map(s => (
              <div key={s.id} className="bg-zinc-900 p-6 rounded-2xl flex items-center justify-between">
                <span>{s.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => setSubjects(subjects.map(x => x.id === s.id ? {...x, archived: false} : x))} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Restore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end">
          <div className="w-full bg-zinc-900 rounded-t-[3rem] p-10 safe-bottom border-t border-white/5">
            <input 
              autoFocus 
              type="text" 
              placeholder="Subject Name" 
              className="w-full bg-transparent text-3xl font-semibold mb-8 focus:outline-none placeholder:text-zinc-800"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubject()}
            />
            <div className="flex flex-wrap gap-3 mb-10">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  onClick={() => setSelectedColor(c)} 
                  className={`w-10 h-10 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110' : 'opacity-30'}`} 
                  style={{backgroundColor: c}} 
                />
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsAddingSubject(false)} className="flex-1 py-4 text-zinc-500 font-bold">Cancel</button>
              <button onClick={addSubject} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold">Create</button>
            </div>
          </div>
        </div>
      )}

      {activeSubject && <Timer subjectName={activeSubject.name} onFinish={completeSession} onCancel={() => setActiveSubject(null)} />}
    </div>
  );
};

export default App;