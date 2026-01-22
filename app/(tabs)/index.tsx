import { SkeletonGameList } from '@/components/skeleton-game-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Bet, useBetSlip } from '@/context/bet-slip-context';
import { useTheme } from '@/context/theme-context';
import { fetchOdds, TransformedGame } from '@/services/odds-api';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const FILTER_PILLS = [
  { id: 'live', label: 'Live', icon: 'dot.radiowaves.left.and.right' },
  { id: 'nba', label: 'NBA', icon: 'basketball.fill' },
  { id: 'nfl', label: 'NFL', icon: 'football.fill' },
  { id: 'nhl', label: 'NHL', icon: 'hockey.puck.fill' },
  { id: 'ncaaf', label: 'NCAAF', icon: 'sportscourt.fill' },
  { id: 'ncaab', label: 'NCAAB', icon: 'figure.basketball' },
];

const PROMO_CARDS = [
  {
    id: 1,
    title: 'Welcome Bonus',
    subtext: 'Get started with a special reward for new members',
  },
  {
    id: 2,
    title: 'Weekly Challenge',
    subtext: 'Complete tasks to earn exclusive prizes',
  },
  {
    id: 3,
    title: 'Refer a Friend',
    subtext: 'Invite friends and both get rewarded',
  },
];

const TABS = ['Events', 'Markets'] as const;

const SPORT_KEYS: Record<string, string> = {
  nba: 'basketball_nba',
  nfl: 'americanfootball_nfl',
  nhl: 'icehockey_nhl',
  ncaaf: 'americanfootball_ncaaf',
  ncaab: 'basketball_ncaab',
};

const formatGameTime = (commenceTime: string): string => {
  const date = new Date(commenceTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatGameDate = (commenceTime: string): string => {
  const date = new Date(commenceTime);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'Today';
  }

  if (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  ) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const PromoCard = memo(function PromoCard({
  card,
  activeColor,
}: {
  card: typeof PROMO_CARDS[0];
  activeColor: string;
}) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardShadowLayer} />
      <View style={styles.card}>
        <View style={styles.cardHighlightTop} />
        <View style={styles.cardHighlightLeft} />
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardSubtext} numberOfLines={2}>
          {card.subtext}
        </Text>
        <View style={styles.cardFooter}>
          <Pressable style={[styles.claimButton, { backgroundColor: activeColor }]}>
            <Text style={styles.claimButtonText}>Claim Now</Text>
          </Pressable>
          <Pressable style={styles.detailsButton}>
            <Text style={styles.detailsText}>Details</Text>
            <IconSymbol size={14} name="chevron.right" color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const FilterPill = memo(function FilterPill({
  pill,
  isActive,
  activeColor,
  onPress,
}: {
  pill: typeof FILTER_PILLS[0];
  isActive: boolean;
  activeColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, isActive && { borderColor: activeColor }]}>
      <View style={styles.pillIcon}>
        <IconSymbol size={14} name={pill.icon} color={isActive ? activeColor : '#666'} />
      </View>
      <Text style={[styles.pillText, isActive && { color: activeColor }]}>
        {pill.label}
      </Text>
    </Pressable>
  );
});

export default function EventsScreen() {
  const { activeColor } = useTheme();
  const { toggleBet, isBetSelected } = useBetSlip();
  const [selectedPill, setSelectedPill] = useState('nba');
  const [selectedTab, setSelectedTab] = useState<'Events' | 'Markets'>('Events');
  const [games, setGames] = useState<TransformedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (selectedPill === 'live') {
        const data = await fetchOdds('basketball_nba');
        const liveGames = data.filter(game => game.isLive);
        setGames(liveGames);
      } else {
        const sportKey = SPORT_KEYS[selectedPill] || 'basketball_nba';
        const data = await fetchOdds(sportKey);
        setGames(data);
      }
    } catch (err) {
      setError('Failed to load odds. Pull to retry.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPill]);

  useEffect(() => {
    loadGames();
  }, [selectedPill]);

  const onRefresh = useCallback(() => {
    loadGames(true);
  }, [loadGames]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(selectedTab === 'Events' ? '0%' : '50%', { duration: 200 }),
    };
  });

  const getBookmakerOddsForBet = (
    game: TransformedGame,
    type: 'spread' | 'total' | 'moneyline',
    side: 'home' | 'away' | 'over' | 'under'
  ): { key: string; title: string; odds: string }[] => {
    return game.bookmakerOdds.map(bm => {
      let odds = '-';
      if (type === 'moneyline' && bm.moneyline) {
        odds = side === 'home' || side === 'over' ? bm.moneyline.home : bm.moneyline.away;
      } else if (type === 'spread' && bm.spread) {
        odds = side === 'home' || side === 'over' ? bm.spread.home : bm.spread.away;
      } else if (type === 'total' && bm.total) {
        odds = side === 'over' ? bm.total.over : bm.total.under;
      }
      return { key: bm.key, title: bm.title, odds };
    });
  };

  const createBet = (
    gameId: string,
    team: string,
    type: 'spread' | 'total' | 'moneyline',
    value: string,
    odds: string,
    league: string,
    gameTime: string,
    commenceTime: string,
    opponent?: string,
    oppositeValue?: string,
    oppositeOdds?: string,
    bookmakerOdds?: { key: string; title: string; odds: string }[]
  ): Bet => ({
    id: `${gameId}-${team}-${type}`,
    gameId,
    team,
    type,
    value,
    odds,
    league,
    gameTime,
    commenceTime,
    opponent,
    oppositeValue,
    oppositeOdds,
    bookmakerOdds,
  });

  const getBookmakerOddsForBetMemo = useCallback((
    game: TransformedGame,
    type: 'spread' | 'total' | 'moneyline',
    side: 'home' | 'away' | 'over' | 'under'
  ) => getBookmakerOddsForBet(game, type, side), []);

  const handleToggleBet = useCallback((bet: Bet) => {
    toggleBet(bet);
  }, [toggleBet]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={activeColor}
          colors={[activeColor]}
        />
      }>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {PROMO_CARDS.map((card) => (
          <PromoCard key={card.id} card={card} activeColor={activeColor} />
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContent}>
        {FILTER_PILLS.map((pill) => (
          <FilterPill
            key={pill.id}
            pill={pill}
            isActive={selectedPill === pill.id}
            activeColor={activeColor}
            onPress={() => setSelectedPill(pill.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => setSelectedTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && { color: '#fff' },
                ]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.tabLine}>
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: activeColor },
              indicatorStyle,
            ]}
          />
        </View>
      </View>

      <View style={styles.gamesContainer}>
        {loading ? (
          <SkeletonGameList />
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol size={48} name="exclamationmark.triangle" color="#666" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol size={48} name="calendar" color="#666" />
            <Text style={styles.emptyText}>No games available</Text>
            <Text style={styles.emptySubtext}>Pull to refresh or try another sport</Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(400)}>
            {games.map((game) => (
              <View key={game.id} style={styles.gameCard}>
              <View style={styles.gameHeader}>
                <View style={styles.gameTimeRow}>
                  {game.isLive ? (
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  ) : (
                    <Text style={styles.gameDateText}>{formatGameDate(game.commenceTime)}</Text>
                  )}
                  <Text style={[styles.gameTimeText, { color: activeColor }]}>
                    {game.isLive ? 'In Progress' : formatGameTime(game.commenceTime)}
                  </Text>
                </View>
                <View style={styles.oddsHeader}>
                  <Text style={styles.oddsHeaderText}>Spread</Text>
                  <Text style={styles.oddsHeaderText}>Total</Text>
                  <Text style={styles.oddsHeaderText}>Money</Text>
                </View>
              </View>

              <View style={styles.teamRow}>
                <View style={styles.teamInfo}>
                  <IconSymbol size={24} name="basketball.fill" color="#666" />
                  <Text style={styles.teamName}>{game.awayAbbrev}</Text>
                </View>
                {game.isLive && game.awayScore !== undefined && (
                  <Text style={styles.scoreText}>{game.awayScore}</Text>
                )}
                <View style={styles.oddsRow}>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.awayAbbrev}-spread`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.awayAbbrev, 'spread', game.spread.away.value, game.spread.away.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, game.homeAbbrev, game.spread.home.value, game.spread.home.odds, getBookmakerOddsForBet(game, 'spread', 'away'))
                      )
                    }>
                    <Text style={styles.oddsValue}>{game.spread.away.value}</Text>
                    <Text style={[styles.oddsSubtext, { color: activeColor }]}>{game.spread.away.odds}</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.awayAbbrev}-total`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.awayAbbrev, 'total', game.total.over.value, game.total.over.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, 'Under', game.total.under.value, game.total.under.odds, getBookmakerOddsForBet(game, 'total', 'over'))
                      )
                    }>
                    <Text style={styles.oddsValue}>{game.total.over.value}</Text>
                    <Text style={[styles.oddsSubtext, { color: activeColor }]}>{game.total.over.odds}</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.awayAbbrev}-moneyline`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.awayAbbrev, 'moneyline', game.moneyline.away.odds, game.moneyline.away.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, game.homeAbbrev, game.moneyline.home.odds, game.moneyline.home.odds, getBookmakerOddsForBet(game, 'moneyline', 'away'))
                      )
                    }>
                    <Text style={[styles.oddsValue, { color: activeColor }]}>
                      {game.moneyline.away.odds}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.teamRow}>
                <View style={styles.teamInfo}>
                  <IconSymbol size={24} name="basketball.fill" color="#666" />
                  <Text style={styles.teamName}>{game.homeAbbrev}</Text>
                </View>
                {game.isLive && game.homeScore !== undefined && (
                  <Text style={styles.scoreText}>{game.homeScore}</Text>
                )}
                <View style={styles.oddsRow}>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.homeAbbrev}-spread`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.homeAbbrev, 'spread', game.spread.home.value, game.spread.home.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, game.awayAbbrev, game.spread.away.value, game.spread.away.odds, getBookmakerOddsForBet(game, 'spread', 'home'))
                      )
                    }>
                    <Text style={styles.oddsValue}>{game.spread.home.value}</Text>
                    <Text style={[styles.oddsSubtext, { color: activeColor }]}>{game.spread.home.odds}</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.homeAbbrev}-total`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.homeAbbrev, 'total', game.total.under.value, game.total.under.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, 'Over', game.total.over.value, game.total.over.odds, getBookmakerOddsForBet(game, 'total', 'under'))
                      )
                    }>
                    <Text style={styles.oddsValue}>{game.total.under.value}</Text>
                    <Text style={[styles.oddsSubtext, { color: activeColor }]}>{game.total.under.odds}</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.oddsButton,
                      isBetSelected(`${game.id}-${game.homeAbbrev}-moneyline`) &&
                        { borderWidth: 2, borderColor: activeColor },
                    ]}
                    onPress={() =>
                      toggleBet(
                        createBet(game.id, game.homeAbbrev, 'moneyline', game.moneyline.home.odds, game.moneyline.home.odds, game.league, formatGameTime(game.commenceTime), game.commenceTime, game.awayAbbrev, game.moneyline.away.odds, game.moneyline.away.odds, getBookmakerOddsForBet(game, 'moneyline', 'home'))
                      )
                    }>
                    <Text style={[styles.oddsValue, { color: activeColor }]}>
                      {game.moneyline.home.odds}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.cardFooterRow}>
                <Text style={styles.leagueText}>{game.league}</Text>
                <View style={styles.cardFooterRight}>
                  <View style={styles.tradedContainer}>
                    <Text style={styles.tradedLabel}>Traded:</Text>
                    <IconSymbol size={12} name="chart.bar.fill" color="#666" />
                    <Text style={styles.tradedValue}>{game.tradedVolume}</Text>
                  </View>
                  <Pressable style={styles.moreBetsButton}>
                    <Text style={styles.moreBetsText}>{game.moreBets} More</Text>
                    <IconSymbol size={12} name="chevron.right" color="#666" />
                  </Pressable>
                </View>
              </View>
            </View>
            ))}
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  /* Promo Cards */
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  cardWrapper: {
    width: 240,
    height: 140,
    position: 'relative',
  },
  cardShadowLayer: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
  },
  card: {
    width: 240,
    height: 140,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHighlightTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#3a3a3a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHighlightLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#333',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtext: {
    color: '#999',
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  claimButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsText: {
    color: '#fff',
    fontSize: 12,
  },

  /* Pills */
  pillsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  pillIcon: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  /* Tabs */
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  tabLine: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: 3,
    borderRadius: 2,
  },

  /* Games */
  gamesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  gameCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#333',
  },
  gameTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameDateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  gameTimeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  oddsHeader: {
    flexDirection: 'row',
    gap: 4,
  },
  oddsHeaderText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
    width: 60,
    textAlign: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  oddsValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  oddsSubtext: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  scoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
    marginRight: 14,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  leagueText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tradedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradedLabel: {
    color: '#666',
    fontSize: 11,
  },
  tradedValue: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  moreBetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moreBetsText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
});
