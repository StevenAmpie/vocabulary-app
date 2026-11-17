import { consecutiveDayCount, nextReviewDate, stateForSuccessCount } from './learning.rules';

describe('learning rules', () => {
  it.each([
    [1, 'DISCOVERED'],
    [2, 'CONSOLIDATING'],
    [3, 'CONSOLIDATING'],
    [4, 'MASTERED'],
  ])('maps %s direct successes to %s', (count, state) => {
    expect(stateForSuccessCount(count)).toBe(state);
  });

  it('schedules longer intervals as mastery grows', () => {
    const now = new Date('2026-11-15T00:00:00.000Z');
    expect(nextReviewDate('DISCOVERED', now).toISOString()).toContain('2026-11-16');
    expect(nextReviewDate('CONSOLIDATING', now).toISOString()).toContain('2026-11-18');
    expect(nextReviewDate('MASTERED', now).toISOString()).toContain('2026-11-29');
  });

  it('counts only consecutive activity ending today', () => {
    const dates = [
      new Date('2026-11-15T00:00:00.000Z'),
      new Date('2026-11-14T00:00:00.000Z'),
      new Date('2026-11-12T00:00:00.000Z'),
    ];
    expect(consecutiveDayCount(dates, new Date('2026-11-15T12:00:00.000Z'))).toBe(2);
  });
});
