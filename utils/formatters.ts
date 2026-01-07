
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Returns the current date in YYYY-MM-DD format specifically for South Korea Time (KST).
 */
export const getTodayKey = (): string => {
  const now = new Date();
  // Format specifically for Seoul timezone
  const seoulDateStr = now.toLocaleDateString('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return seoulDateStr; // en-CA returns YYYY-MM-DD
};

export const formatSubjectName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
