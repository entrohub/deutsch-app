import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f23' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0f0f23' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Deutsch Lernen', headerShown: false }}
        />
        <Stack.Screen
          name="learn"
          options={{ title: '学习新词' }}
        />
        <Stack.Screen
          name="review"
          options={{ title: '复习' }}
        />
      </Stack>
    </>
  );
}
