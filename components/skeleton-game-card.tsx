import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function SkeletonGameCard() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.dateSkeleton, animatedStyle]} />
        <View style={styles.oddsHeaderSkeleton}>
          <Animated.View style={[styles.headerText, animatedStyle]} />
          <Animated.View style={[styles.headerText, animatedStyle]} />
          <Animated.View style={[styles.headerText, animatedStyle]} />
        </View>
      </View>

      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Animated.View style={[styles.teamIcon, animatedStyle]} />
          <Animated.View style={[styles.teamName, animatedStyle]} />
        </View>
        <View style={styles.oddsRow}>
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
        </View>
      </View>

      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Animated.View style={[styles.teamIcon, animatedStyle]} />
          <Animated.View style={[styles.teamName, animatedStyle]} />
        </View>
        <View style={styles.oddsRow}>
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
          <Animated.View style={[styles.oddsButton, animatedStyle]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Animated.View style={[styles.footerText, animatedStyle]} />
        <Animated.View style={[styles.footerRight, animatedStyle]} />
      </View>
    </View>
  );
}

export function SkeletonGameList() {
  return (
    <View style={styles.container}>
      <SkeletonGameCard />
      <SkeletonGameCard />
      <SkeletonGameCard />
      <SkeletonGameCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  oddsHeaderSkeleton: {
    flexDirection: 'row',
    gap: 4,
  },
  headerText: {
    width: 60,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  teamName: {
    width: 50,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  oddsButton: {
    width: 60,
    height: 44,
    backgroundColor: '#252525',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  footerText: {
    width: 40,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  footerRight: {
    width: 120,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
  },
});
