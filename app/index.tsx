import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { words } from '../data/words';
import { getAllProgress, getLearnedWordIds } from '../lib/storage';
import { isDueForReview } from '../lib/spaced-repetition';
import { CardProgress } from '../types';

export default function HomeScreen() {
  const [stats, setStats] = useState({
    total: words.length,
    learned: 0,
    dueReview: 0,
    mastered: 0,
    newToday: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    const learnedIds = await getLearnedWordIds();
    const allProgress = await getAllProgress();
    const progressList = Object.values(allProgress) as CardProgress[];

    const dueCount = progressList.filter(isDueForReview).length;
    const masteredCount = progressList.filter(
      (p) => p.repetitions >= 5 && p.interval >= 21
    ).length;

    setStats({
      total: words.length,
      learned: learnedIds.length,
      dueReview: dueCount,
      mastered: masteredCount,
      newToday: 0,
    });
  }

  const remaining = stats.total - stats.learned;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Deutsch Lernen</Text>
        <Text style={styles.subtitle}>德语单词学习</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#1e3a5f' }]}>
            <Text style={styles.statNumber}>{stats.dueReview}</Text>
            <Text style={styles.statLabel}>待复习</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#3a1e5f' }]}>
            <Text style={styles.statNumber}>{stats.learned}</Text>
            <Text style={styles.statLabel}>已学习</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#1e5f3a' }]}>
            <Text style={styles.statNumber}>{stats.mastered}</Text>
            <Text style={styles.statLabel}>已掌握</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#5f3a1e' }]}>
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>未学习</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(stats.learned / stats.total) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stats.learned} / {stats.total} 词
          </Text>
        </View>

        {/* Action buttons */}
        {stats.dueReview > 0 && (
          <Pressable
            style={[styles.button, styles.reviewButton]}
            onPress={() => router.push('/review')}
          >
            <Text style={styles.buttonText}>
              开始复习 ({stats.dueReview} 词)
            </Text>
          </Pressable>
        )}

        {remaining > 0 && (
          <Pressable
            style={[styles.button, styles.learnButton]}
            onPress={() => router.push('/learn')}
          >
            <Text style={styles.buttonText}>
              学习新词 (10 词)
            </Text>
          </Pressable>
        )}

        {stats.dueReview === 0 && remaining === 0 && (
          <View style={styles.doneContainer}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneText}>全部完成！明天再来复习吧</Text>
          </View>
        )}

        {/* Level breakdown */}
        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>词汇级别</Text>
          {(['A1', 'A2', 'B1'] as const).map((level) => {
            const levelWords = words.filter((w) => w.level === level);
            return (
              <View key={level} style={styles.levelRow}>
                <Text style={styles.levelLabel}>{level}</Text>
                <Text style={styles.levelCount}>{levelWords.length} 词</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewButton: {
    backgroundColor: '#E74C6F',
  },
  learnButton: {
    backgroundColor: '#4A90D9',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  doneContainer: {
    alignItems: 'center',
    padding: 30,
  },
  doneEmoji: {
    fontSize: 48,
  },
  doneText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 12,
  },
  levelSection: {
    marginTop: 20,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  levelLabel: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  levelCount: {
    color: '#888',
    fontSize: 16,
  },
});
