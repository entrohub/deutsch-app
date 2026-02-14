import { CardProgress, Rating } from '../types';

export function createNewProgress(wordId: string): CardProgress {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date().toISOString().split('T')[0],
  };
}

export function calculateNextReview(
  progress: CardProgress,
  rating: Rating
): CardProgress {
  let { easeFactor, interval, repetitions } = progress;

  if (rating < 3) {
    repetitions = 0;
    interval = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + (interval === 0 ? 0 : interval));
  const nextReview = nextDate.toISOString().split('T')[0];

  return {
    wordId: progress.wordId,
    easeFactor,
    interval,
    repetitions,
    nextReview,
    lastReview: new Date().toISOString().split('T')[0],
  };
}

export function isDueForReview(progress: CardProgress): boolean {
  const today = new Date().toISOString().split('T')[0];
  return progress.nextReview <= today;
}
