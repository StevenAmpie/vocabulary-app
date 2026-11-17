import { WordState } from './learning.types';

export function stateForSuccessCount(count: number): WordState {
  if (count >= 4) return 'MASTERED';
  if (count >= 2) return 'CONSOLIDATING';
  return 'DISCOVERED';
}

export function nextReviewDate(state: WordState, now = new Date()): Date {
  const days = state === 'MASTERED' ? 14 : state === 'CONSOLIDATING' ? 3 : 1;
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function consecutiveDayCount(activityDates: Date[], today = new Date()): number {
  const dateSet = new Set(activityDates.map((date) => date.toISOString().slice(0, 10)));
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let count = 0;
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
