import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBetSlip } from '@/context/bet-slip-context';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export function BetConfirmation() {
  const { showConfirmation, confirmationType, hideConfirmation } = useBetSlip();
  const { activeColor } = useTheme();
  const router = useRouter();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (showConfirmation) {
      progress.value = 0;
      progress.value = withDelay(
        100,
        withTiming(1, { duration: 3800, easing: Easing.linear })
      );

      const timer = setTimeout(() => {
        hideConfirmation();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleViewSlip = () => {
    hideConfirmation();
    router.push('/Portfolio');
  };

  if (!showConfirmation) return null;

  return (
    <Animated.View
      entering={SlideInDown.duration(300).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutDown.duration(250).easing(Easing.in(Easing.cubic))}
      style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.checkCircle, { backgroundColor: activeColor }]}>
            <IconSymbol size={14} name="checkmark" color="#000" />
          </View>
          <Text style={styles.text}>
            {confirmationType === 'parlay' ? 'Parlay' : 'Pick'} Submitted
          </Text>
        </View>
        <Pressable onPress={handleViewSlip} style={styles.viewButton}>
          <Text style={[styles.viewButtonText, { color: activeColor }]}>View Slip</Text>
          <IconSymbol size={14} name="chevron.right" color={activeColor} />
        </Pressable>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { backgroundColor: activeColor }, progressStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#333',
  },
  progressBar: {
    height: '100%',
  },
});
