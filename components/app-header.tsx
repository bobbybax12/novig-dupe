import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 22;
const THUMB_OFFSET = 2;

export function AppHeader() {
  const { isEnabled, setIsEnabled, activeColor, balance } = useTheme();
  const progress = useSharedValue(isEnabled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isEnabled ? 1 : 0, { duration: 200 });
  }, [isEnabled]);

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
  };

  const thumbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#FFD700', '#5AC8FA']
    ),
    transform: [
      {
        translateX: withTiming(
          progress.value === 1
            ? TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET
            : THUMB_OFFSET,
          { duration: 200 }
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/novig.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <Pressable onPress={toggleSwitch}>
        <View style={styles.balancePill}>
          <View style={styles.balanceContainer}>
            <Animated.Text
              key={balance}
              entering={FadeIn.duration(200)}
              style={[styles.balanceText, { color: activeColor }]}
            >
              {balance}
            </Animated.Text>
          </View>

          <View style={styles.track}>
            <Animated.View style={[styles.thumb, thumbStyle]}>
              <IconSymbol
                size={12}
                name={isEnabled ? 'dollarsign' : 'bitcoinsign'}
                color="#000"
              />
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  logo: {
    width: 100,
    height: 32,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    gap: 10,
  },
  balanceContainer: {
    width: 75,
    alignItems: 'flex-start',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: '#333',
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
