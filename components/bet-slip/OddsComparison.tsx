import { Bet } from '@/context/bet-slip-context';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { calculateVigOdds } from './odds-utils';

interface OddsComparisonProps {
  bet: Bet;
  displayOdds: string;
  activeColor: string;
}

export const OddsComparison = memo(function OddsComparison({
  bet,
  displayOdds,
  activeColor,
}: OddsComparisonProps) {
  if (bet.bookmakerOdds && bet.bookmakerOdds.length > 0) {
    return (
      <View style={styles.container}>
        {bet.bookmakerOdds.map((bm) => (
          <View key={bm.key} style={styles.row}>
            <Text style={styles.bookmakerName}>{bm.title}</Text>
            <Text style={styles.bookmakerOddsDim}>{bm.odds}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.bookmakerName, { color: activeColor }]}>Novig</Text>
        <Text style={[styles.bookmakerOdds, { color: activeColor }]}>{displayOdds}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.bookmakerName}>DraftKings</Text>
        <Text style={styles.bookmakerOddsDim}>{calculateVigOdds(displayOdds)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.bookmakerName}>FanDuel</Text>
        <Text style={styles.bookmakerOddsDim}>{calculateVigOdds(displayOdds)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.bookmakerName}>BetMGM</Text>
        <Text style={styles.bookmakerOddsDim}>{calculateVigOdds(displayOdds)}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#252525',
    borderRadius: 10,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmakerName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  bookmakerOdds: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookmakerOddsDim: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
});
