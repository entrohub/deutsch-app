export interface Word {
  id: string;
  german: string;
  chinese: string;
  gender?: 'der' | 'die' | 'das';
  partOfSpeech: string;
  example?: string;
  exampleChinese?: string;
  level: 'A1' | 'A2' | 'B1';
}

export interface CardProgress {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview?: string;
}

export type Rating = 0 | 3 | 4 | 5;

export const RATING_LABELS: Record<Rating, string> = {
  0: '忘记',
  3: '模糊',
  4: '记住',
  5: '简单',
};

export const GENDER_COLORS: Record<string, string> = {
  der: '#4A90D9',
  die: '#E74C6F',
  das: '#50C878',
};
