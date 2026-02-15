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
import { Word, Rating, RATING_LABELS } from '../types';
import {
  getLearnedWordIds,
  addLearnedWordIds,
  saveProgress,
} from '../lib/storage';
import { createNewProgress, calculateNextReview } from '../lib/spaced-repetition';

const BATCH_SIZE = 10;

export default function LearnScreen() {
  const [batch, setBatch] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewWords();
  }, []);

  async function loadNewWords() {
    const learnedIds = await getLearnedWordIds();
    const learnedSet = new Set(learnedIds);
    const unlearned = words.filter((w) => !learnedSet.has(w.id));
    // Shuffle then pick
    const shuffled = [...unlearned].sort(() => Math.random() - 0.5);
    const newBatch = shuffled.slice(0, BATCH_SIZE);
    setBatch(newBatch);
    setLoading(false);

    if (newBatch.length > 0) {
      await addLearnedWordIds(newBatch.map((w) => w.id));
      for (const word of newBatch) {
        const progress = createNewProgress(word.id);
        await saveProgress(progress);
      }
    }
  }

  const currentWord = batch[currentIndex];

  async function handleRating(rating: Rating) {
    if (!currentWord) return;

    const progress = createNewProgress(currentWord.id);
    const updated = calculateNextReview(progress, rating);
    await saveProgress(updated);

    if (currentIndex < batch.length - 1) {
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

  if (batch.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneText}>所有单词都已学习！</Text>
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
            本轮学习完成！学了 {batch.length} 个新词
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
            {currentIndex + 1} / {batch.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / batch.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <FlashCard
            key={currentWord.id}
            word={currentWord}
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
    marginBottom: 20,
  },
  progressText: {
    color: '#aaa',
    fontSize: 14,
    width: 50,
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
    backgroundColor: '#4A90D9',
    borderRadius: 3,
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
