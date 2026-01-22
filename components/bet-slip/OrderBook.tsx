import { Bet } from '@/context/bet-slip-context';
import React, { memo, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { generateOrderBookLevels, getOppositeSide } from './odds-utils';

const AnimatedLiquidityBar = memo(function AnimatedLiquidityBar({
  liquidity,
  maxLiquidity,
  wagerAmount,
  activeColor,
  isSelectedSide,
  isSelectedRow,
}: {
  liquidity: number;
  maxLiquidity: number;
  wagerAmount: number;
  activeColor: string;
  isSelectedSide: boolean;
  isSelectedRow: boolean;
}) {
  const fillProgress = useSharedValue(0);
  const totalWidthPercent = (liquidity / maxLiquidity) * 100;

  useEffect(() => {
    fillProgress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, []);

  const wagerRatio = wagerAmount > 0 ? Math.min(wagerAmount / liquidity, 1) : 0;
  const wagerFillPercent = wagerRatio * totalWidthPercent;

  const backgroundStyle = useAnimatedStyle(() => ({
    width: `${totalWidthPercent * fillProgress.value}%`,
  }));

  const wagerStyle = useAnimatedStyle(() => ({
    width: `${wagerFillPercent * fillProgress.value}%`,
  }));

  return (
    <View style={styles.liquidityBarContainer}>
      <Animated.View
        style={[
          styles.liquidityBar,
          isSelectedSide ? {} : styles.liquidityBarRight,
          { backgroundColor: '#3a3a3a' },
          backgroundStyle,
        ]}
      />
      {isSelectedSide && isSelectedRow && wagerAmount > 0 && (
        <Animated.View
          style={[
            styles.liquidityBar,
            { backgroundColor: activeColor + '60' },
            wagerStyle,
          ]}
        />
      )}
    </View>
  );
});

interface OrderBookProps {
  bet: Bet;
  activeColor: string;
  isEnabled: boolean;
  wagerAmount: number;
  onOddsSelect: (index: number, odds: string) => void;
  selectedOddsIndex: number;
}

export const OrderBook = memo(function OrderBook({
  bet,
  activeColor,
  wagerAmount,
  onOddsSelect,
  selectedOddsIndex,
}: OrderBookProps) {
  const selectedSideLevels = useMemo(() => generateOrderBookLevels(bet.odds, true), [bet.odds]);
  const oppositeSideLevels = useMemo(() =>
    generateOrderBookLevels(bet.oppositeOdds || bet.odds, false),
    [bet.odds, bet.oppositeOdds]
  );

  const maxLiquidity = Math.max(
    ...selectedSideLevels.map(l => l.liquidity),
    ...oppositeSideLevels.map(l => l.liquidity)
  );

  const getSelectedLabel = () => {
    if (bet.type === 'moneyline') return bet.team;
    if (bet.type === 'total') return bet.value;
    return `${bet.team} ${bet.value}`;
  };

  const getOppositeLabel = () => {
    if (bet.type === 'moneyline') return bet.opponent || 'OPP';
    if (bet.type === 'total') return bet.oppositeValue || getOppositeSide(bet);
    return bet.opponent ? `${bet.opponent} ${bet.oppositeValue || ''}` : getOppositeSide(bet);
  };

  const getEffectiveLevel = () => {
    for (let i = 0; i < selectedSideLevels.length; i++) {
      if (selectedSideLevels[i].cumulativeLiquidity >= wagerAmount) {
        return i;
      }
    }
    return selectedSideLevels.length - 1;
  };

  const effectiveLevel = wagerAmount > 0 ? getEffectiveLevel() : selectedOddsIndex;

  const handleRowPress = (index: number) => {
    if (wagerAmount > 0 && selectedSideLevels[index].cumulativeLiquidity < wagerAmount) {
      const validLevel = getEffectiveLevel();
      onOddsSelect(validLevel, selectedSideLevels[validLevel].odds);
    } else {
      onOddsSelect(index, selectedSideLevels[index].odds);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.columnHeaders}>
        <View style={[styles.columnHeader, styles.selectedColumn]}>
          <Text style={[styles.columnTitle, { color: activeColor }]}>{getSelectedLabel()}</Text>
        </View>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>{getOppositeLabel()}</Text>
        </View>
      </View>

      <View style={styles.rows}>
        {selectedSideLevels.map((level, i) => (
          <View key={i} style={styles.row}>
            <Pressable
              style={[
                styles.cell,
                styles.selectedCell,
                effectiveLevel === i && { borderColor: activeColor, borderWidth: 1 },
              ]}
              onPress={() => handleRowPress(i)}>
              <AnimatedLiquidityBar
                liquidity={level.liquidity}
                maxLiquidity={maxLiquidity}
                wagerAmount={effectiveLevel === i ? wagerAmount : 0}
                activeColor={activeColor}
                isSelectedSide={true}
                isSelectedRow={effectiveLevel === i}
              />
              <Text style={[styles.oddsText, { color: activeColor }]}>{level.odds}</Text>
              <Text style={styles.volumeText}>${level.liquidity.toFixed(2)}</Text>
            </Pressable>

            <View style={styles.cell}>
              <AnimatedLiquidityBar
                liquidity={oppositeSideLevels[i].liquidity}
                maxLiquidity={maxLiquidity}
                wagerAmount={0}
                activeColor={activeColor}
                isSelectedSide={false}
                isSelectedRow={false}
              />
              <Text style={styles.oddsTextDim}>{oppositeSideLevels[i].odds}</Text>
              <Text style={styles.volumeText}>${oppositeSideLevels[i].liquidity.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  columnHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  columnHeader: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  selectedColumn: {
    backgroundColor: '#252525',
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  rows: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCell: {
    backgroundColor: '#2a2a2a',
  },
  liquidityBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  liquidityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  liquidityBarRight: {
    left: 'auto',
    right: 0,
  },
  oddsText: {
    fontSize: 15,
    fontWeight: '700',
    zIndex: 1,
  },
  oddsTextDim: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
    zIndex: 1,
  },
  volumeText: {
    color: '#fff',
    fontSize: 12,
    zIndex: 1,
  },
});
