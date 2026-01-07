
export interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // in seconds
  timestamp: number;
  memo?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  archived?: boolean;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  sessions: StudySession[];
}
