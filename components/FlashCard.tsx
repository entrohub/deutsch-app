import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Word, GENDER_COLORS } from '../types';

interface FlashCardProps {
  word: Word;
  onFlip?: (isBack: boolean) => void;
}

export default function FlashCard({ word, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const flip = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
    onFlip?.(!isFlipped);
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'de-DE',
      rate: 0.85,
    });
  };

  const genderColor = word.gender ? GENDER_COLORS[word.gender] : '#FFFFFF';
  const genderLabel = word.gender ? `${word.gender} ` : '';

  return (
    <Pressable onPress={flip} style={styles.container}>
      {/* Front */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          { transform: [{ rotateY: frontInterpolate }] },
        ]}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{word.level}</Text>
        </View>
        <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
        {word.gender && (
          <Text style={[styles.gender, { color: genderColor }]}>
            {word.gender}
          </Text>
        )}
        <Text style={[styles.germanWord, word.gender && { color: genderColor }]}>
          {genderLabel}{word.german}
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            speak(word.german);
          }}
          style={styles.speakButton}
        >
          <Text style={styles.speakIcon}>🔊</Text>
        </Pressable>
        <Text style={styles.tapHint}>点击翻转</Text>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ rotateY: backInterpolate }] },
        ]}
      >
        <Text style={styles.chineseWord}>{word.chinese}</Text>
        {word.example && (
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Beispiel:</Text>
            <Text style={styles.exampleText}>{word.example}</Text>
            {word.exampleChinese && (
              <Text style={styles.exampleChinese}>{word.exampleChinese}</Text>
            )}
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                speak(word.example!);
              }}
              style={styles.speakButtonSmall}
            >
              <Text style={styles.speakIcon}>🔊</Text>
            </Pressable>
          </View>
        )}
        <Text style={styles.tapHint}>点击翻转</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  front: {
    backgroundColor: '#16213e',
  },
  back: {
    backgroundColor: '#1a1a40',
  },
  levelBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  partOfSpeech: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  gender: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  germanWord: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  chineseWord: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  exampleLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
  },
  exampleText: {
    color: '#e0e0e0',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  exampleChinese: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  speakButton: {
    marginTop: 8,
    padding: 8,
  },
  speakButtonSmall: {
    padding: 4,
  },
  speakIcon: {
    fontSize: 28,
  },
  tapHint: {
    position: 'absolute',
    bottom: 16,
    color: '#555',
    fontSize: 12,
  },
});
