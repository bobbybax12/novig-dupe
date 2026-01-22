import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const KEYBOARD_HEIGHT = 220;

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del'],
];

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  visible: boolean;
  activeColor: string;
}

export const CustomKeyboard = memo(function CustomKeyboard({
  onKeyPress,
  onDelete,
  visible,
}: CustomKeyboardProps) {
  const heightAnim = useSharedValue(0);

  useEffect(() => {
    heightAnim.value = withTiming(visible ? KEYBOARD_HEIGHT : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    opacity: interpolate(heightAnim.value, [0, KEYBOARD_HEIGHT * 0.3, KEYBOARD_HEIGHT], [0, 0.5, 1]),
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.grid}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.key,
                  key === 'del' && styles.deleteKey,
                  pressed && styles.keyPressed,
                ]}
                onPress={() => {
                  if (key === 'del') {
                    onDelete();
                  } else {
                    onKeyPress(key);
                  }
                }}>
                {key === 'del' ? (
                  <IconSymbol size={24} name="delete.left" color="#fff" />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  grid: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  key: {
    flex: 1,
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteKey: {
    backgroundColor: '#333',
  },
  keyPressed: {
    backgroundColor: '#444',
  },
  keyText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '500',
  },
});
