import AsyncStorage from '@react-native-async-storage/async-storage';
import { CardProgress } from '../types';

const PROGRESS_KEY = 'card_progress';
const LEARNED_KEY = 'learned_word_ids';

export async function getAllProgress(): Promise<Record<string, CardProgress>> {
  const data = await AsyncStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data) : {};
}

export async function saveProgress(progress: CardProgress): Promise<void> {
  const all = await getAllProgress();
  all[progress.wordId] = progress;
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export async function getLearnedWordIds(): Promise<string[]> {
  const data = await AsyncStorage.getItem(LEARNED_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addLearnedWordIds(ids: string[]): Promise<void> {
  const existing = await getLearnedWordIds();
  const merged = Array.from(new Set([...existing, ...ids]));
  await AsyncStorage.setItem(LEARNED_KEY, JSON.stringify(merged));
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([PROGRESS_KEY, LEARNED_KEY]);
}
