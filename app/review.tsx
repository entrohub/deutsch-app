import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashCard from '../components/FlashCard';
import { words } from '../data/words';
import { Word, Rating, RATING_LABELS, CardProgress } from '../types';
import { getAllProgress, saveProgress } from '../lib/storage';
import { calculateNextReview, isDueForReview } from '../lib/spaced-repetition';

export default function ReviewScreen() {
  const [dueCards, setDueCards] = useState<
    { word: Word; progress: CardProgress }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    loadDueCards();
  }, []);

  async function loadDueCards() {
    const allProgress = await getAllProgress();
    const wordMap = new Map(words.map((w) => [w.id, w]));

    const due: { word: Word; progress: CardProgress }[] = [];
    for (const p of Object.values(allProgress)) {
      const progress = p as CardProgress;
      if (isDueForReview(progress)) {
        const word = wordMap.get(progress.wordId);
        if (word) {
          due.push({ word, progress });
        }
      }
    }

    // Sort: lower ease factor first (harder cards first)
    due.sort((a, b) => a.progress.easeFactor - b.progress.easeFactor);

    setDueCards(due);
    setLoading(false);
  }

  const current = dueCards[currentIndex];

  async function handleRating(rating: Rating) {
    if (!current) return;

    const updated = calculateNextReview(current.progress, rating);
    await saveProgress(updated);
    setReviewedCount((prev) => prev + 1);

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setFinished(true);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (dueCards.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneText}>没有需要复习的词！</Text>
          <Text style={styles.subText}>去学习新词或者明天再来</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回首页</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>✅</Text>
          <Text style={styles.doneText}>
            复习完成！共复习了 {reviewedCount} 个词
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回首页</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {dueCards.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / dueCards.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            复习次数: {current.progress.repetitions} | 间隔:{' '}
            {current.progress.interval}天
          </Text>
        </View>

        <View style={styles.cardWrapper}>
          <FlashCard
            key={current.word.id}
            word={current.word}
            onFlip={(back) => setIsFlipped(back)}
          />
        </View>

        {isFlipped && (
          <View style={styles.ratingRow}>
            {([0, 3, 4, 5] as Rating[]).map((rating) => (
              <Pressable
                key={rating}
                style={[
                  styles.ratingButton,
                  {
                    backgroundColor:
                      rating === 0
                        ? '#E74C6F'
                        : rating === 3
                        ? '#F5A623'
                        : rating === 4
                        ? '#4A90D9'
                        : '#50C878',
                  },
                ]}
                onPress={() => handleRating(rating)}
              >
                <Text style={styles.ratingText}>{RATING_LABELS[rating]}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {!isFlipped && (
          <Text style={styles.hint}>点击卡片查看释义</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressText: {
    color: '#aaa',
    fontSize: 14,
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a1a3e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E74C6F',
    borderRadius: 3,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  ratingButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: '#555',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  doneEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  doneText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
