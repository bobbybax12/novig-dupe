import { IconSymbol } from '@/components/ui/icon-symbol';
import { PlacedBet, useBetSlip } from '@/context/bet-slip-context';
import { useTheme } from '@/context/theme-context';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameStatusFilter = 'All' | 'Live' | 'Pregame';
type OrderStatusFilter = 'All' | 'Matched' | 'Unmatched';

const FilterOption = memo(function FilterOption({
  label,
  isSelected,
  onPress,
  activeColor,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  activeColor: string;
}) {
  const borderProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    borderProgress.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: 2,
    borderColor: `rgba(${activeColor === '#5AC8FA' ? '90, 200, 250' : '255, 215, 0'}, ${borderProgress.value})`,
  }));

  return (
    <Pressable onPress={onPress} style={styles.filterOptionWrapper}>
      <Animated.View style={[styles.filterOption, animatedStyle]}>
        <Text style={[styles.filterOptionText, isSelected && { color: activeColor }]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const TABS = ['Active', 'Settled'] as const;

const BetCard = memo(function BetCard({
  placedBet,
  index,
  activeColor,
}: {
  placedBet: PlacedBet;
  index: number;
  activeColor: string;
}) {
  const isParlay = placedBet.bets.length > 1;
  const statusColor =
    placedBet.status === 'won'
      ? '#22c55e'
      : placedBet.status === 'lost'
      ? '#ef4444'
      : activeColor;

  const shortId = placedBet.id.replace('placed-', '').slice(-6);

  const getLeagueIcon = (league?: string) => {
    if (!league) return 'sportscourt.fill';
    if (league.toLowerCase().includes('nba') || league.toLowerCase().includes('basketball')) return 'basketball.fill';
    if (league.toLowerCase().includes('nfl') || league.toLowerCase().includes('football')) return 'football.fill';
    if (league.toLowerCase().includes('nhl') || league.toLowerCase().includes('hockey')) return 'hockey.puck.fill';
    return 'sportscourt.fill';
  };

  const getBetTypeLabel = (type: string) => {
    switch (type) {
      case 'spread': return 'Spread';
      case 'total': return 'Total';
      case 'moneyline': return 'Moneyline';
      default: return type;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}hr ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300).delay(index * 50)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.duration(200)}
      style={styles.betCard}>
      <View style={styles.betHeader}>
        <Text style={styles.timeAgoText}>{getTimeAgo(placedBet.placedAt)}</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {placedBet.status.toUpperCase()}
        </Text>
      </View>

      {placedBet.bets.map((bet, idx) => (
        <View key={bet.id} style={styles.legSection}>
          <View style={styles.leagueRow}>
            <IconSymbol size={14} name={getLeagueIcon(bet.league)} color="#666" />
            <Text style={styles.leagueText}>{bet.league || 'Sports'}</Text>
            <Text style={styles.gameTimeText}>{bet.gameTime || ''}</Text>
          </View>

          <View style={styles.pickRow}>
            <Text style={styles.pickTeam}>{bet.team}</Text>
            <Text style={[styles.pickOdds, { color: activeColor }]}>{bet.odds}</Text>
          </View>

          <Text style={styles.betTypeText}>{getBetTypeLabel(bet.type)}</Text>

          <Text style={styles.matchupText}>
            {bet.team} vs {bet.opponent || 'Opponent'}
          </Text>

          {idx < placedBet.bets.length - 1 && <View style={styles.legDivider} />}
        </View>
      ))}

      {isParlay && (
        <View style={styles.parlayRow}>
          <Text style={styles.parlayText}>{placedBet.bets.length} Leg Parlay</Text>
          <Text style={[styles.parlayOdds, { color: activeColor }]}>{placedBet.totalOdds}</Text>
        </View>
      )}

      <View style={styles.bottomSection}>
        <View style={styles.wagerPayoutSection}>
          <View style={[styles.currencyIconLarge, { backgroundColor: placedBet.currency === 'usd' ? '#5AC8FA' : '#FFD700' }]}>
            <IconSymbol size={16} name={placedBet.currency === 'usd' ? 'dollarsign' : 'bitcoinsign'} color="#000" />
          </View>
          <View style={styles.wagerPayoutTexts}>
            <View style={styles.wagerRow}>
              <Text style={styles.wagerLabel}>Wager</Text>
              <Text style={styles.wagerValue}>${placedBet.wager.toFixed(2)}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>
                {placedBet.status === 'won' ? 'Won' : placedBet.status === 'lost' ? 'Return' : 'To Win'}
              </Text>
              <Text style={[
                styles.payoutValue,
                placedBet.status === 'won' && { color: '#22c55e' },
                placedBet.status === 'lost' && { color: '#ef4444' },
              ]}>
                ${placedBet.status === 'lost' ? '0.00' : placedBet.potentialPayout.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.idShareSection}>
          <Text style={styles.pickIdText}>Pick ID: {shortId}</Text>
          <Pressable style={styles.shareButton}>
            <IconSymbol size={18} name="square.and.arrow.up" color="#666" />
          </Pressable>
        </View>
      </View>

      <View style={styles.perforatedEdge}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.perforationDot} />
        ))}
      </View>
    </Animated.View>
  );
});

export default function PortfolioScreen() {
  const { activeColor, isEnabled } = useTheme();
  const { placedBets, settleBet } = useBetSlip();
  const [selectedTab, setSelectedTab] = useState<'Active' | 'Settled'>('Active');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Modal animation
  const modalProgress = useSharedValue(0);

  // Filter states
  const [gameStatusFilter, setGameStatusFilter] = useState<GameStatusFilter>('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('All');

  // Temp filter states for modal
  const [tempGameStatus, setTempGameStatus] = useState<GameStatusFilter>('All');
  const [tempOrderStatus, setTempOrderStatus] = useState<OrderStatusFilter>('All');

  const hasActiveFilters = gameStatusFilter !== 'All' || orderStatusFilter !== 'All';

  useEffect(() => {
    if (modalVisible) {
      modalProgress.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    }
  }, [modalVisible]);

  const openFilterModal = useCallback(() => {
    setTempGameStatus(gameStatusFilter);
    setTempOrderStatus(orderStatusFilter);
    modalProgress.value = 0;
    setModalVisible(true);
  }, [gameStatusFilter, orderStatusFilter]);

  const closeFilterModal = useCallback(() => {
    modalProgress.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) });
    setTimeout(() => setModalVisible(false), 250);
  }, []);

  const applyFilters = useCallback(() => {
    setGameStatusFilter(tempGameStatus);
    setOrderStatusFilter(tempOrderStatus);
    closeFilterModal();
  }, [tempGameStatus, tempOrderStatus, closeFilterModal]);

  const resetFilters = useCallback(() => {
    setTempGameStatus('All');
    setTempOrderStatus('All');
  }, []);

  const clearFilter = useCallback((type: 'game' | 'order') => {
    if (type === 'game') setGameStatusFilter('All');
    if (type === 'order') setOrderStatusFilter('All');
  }, []);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: modalProgress.value * 0.6,
  }));

  const modalContentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(modalProgress.value, [0, 1], [400, 0]) },
    ],
  }));

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(selectedTab === 'Active' ? '0%' : '50%', { duration: 200 }),
    };
  });

  const currentCurrency = isEnabled ? 'usd' : 'btc';

  const isBetLive = useCallback((bet: PlacedBet): boolean => {
    const now = new Date();
    return bet.bets.some((leg) => {
      if (!leg.commenceTime) return false;
      const gameStart = new Date(leg.commenceTime);
      return gameStart <= now;
    });
  }, []);

  const displayedBets = useMemo(() => {
    let filtered = placedBets.filter((bet) => bet.currency === currentCurrency);

    if (gameStatusFilter !== 'All') {
      filtered = filtered.filter((bet) => {
        if (gameStatusFilter === 'Live') return isBetLive(bet);
        return !isBetLive(bet);
      });
    }

    if (orderStatusFilter === 'Matched') {
      filtered = filtered.filter(() => true);
    } else if (orderStatusFilter === 'Unmatched') {
      filtered = filtered.filter(() => false);
    }

    return selectedTab === 'Active'
      ? filtered.filter((bet) => bet.status === 'active')
      : filtered.filter((bet) => bet.status !== 'active');
  }, [placedBets, currentCurrency, gameStatusFilter, orderStatusFilter, selectedTab, isBetLive]);

  const renderBetCard = useCallback(({ item, index }: { item: PlacedBet; index: number }) => (
    <BetCard placedBet={item} index={index} activeColor={activeColor} />
  ), [activeColor]);

  const keyExtractor = useCallback((item: PlacedBet) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Tabs Row with Filter */}
      <View style={styles.tabsWrapper}>
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

        {/* Filter Icon */}
        <Pressable style={styles.filterIconButton} onPress={openFilterModal}>
          <IconSymbol size={20} name="line.3.horizontal.decrease" color="#fff" />
        </Pressable>
      </View>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition.duration(200)}
          style={styles.filterPillsRow}>
          {gameStatusFilter !== 'All' && (
            <Animated.View
              entering={SlideInRight.duration(250).easing(Easing.out(Easing.cubic))}
              exiting={FadeOut.duration(150)}>
              <Pressable
                style={[styles.filterPill, { borderColor: activeColor }]}
                onPress={() => clearFilter('game')}>
                <Text style={styles.filterPillText}>{gameStatusFilter}</Text>
                <IconSymbol size={12} name="xmark" color="#fff" />
              </Pressable>
            </Animated.View>
          )}
          {orderStatusFilter !== 'All' && (
            <Animated.View
              entering={SlideInRight.duration(250).delay(50).easing(Easing.out(Easing.cubic))}
              exiting={FadeOut.duration(150)}>
              <Pressable
                style={[styles.filterPill, { borderColor: activeColor }]}
                onPress={() => clearFilter('order')}>
                <Text style={styles.filterPillText}>{orderStatusFilter}</Text>
                <IconSymbol size={12} name="xmark" color="#fff" />
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {displayedBets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            size={48}
            name={selectedTab === 'Active' ? 'doc.text' : 'checkmark.circle'}
            color="#666"
          />
          <Text style={styles.emptyText}>
            {selectedTab === 'Active' ? 'No active bets' : 'No settled bets'}
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedTab === 'Active'
              ? 'Place a bet to see it here'
              : 'Your settled bets will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedBets}
          renderItem={renderBetCard}
          keyExtractor={keyExtractor}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={5}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeFilterModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeFilterModal}>
            <Animated.View style={[styles.modalBackdropInner, backdropStyle]} />
          </Pressable>
          <Animated.View style={[styles.modalContent, modalContentStyle]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Active Filters</Text>

            {/* By Game Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>By Game Status</Text>
              <View style={styles.filterOptions}>
                {(['All', 'Live', 'Pregame'] as GameStatusFilter[]).map((option) => (
                  <FilterOption
                    key={option}
                    label={option}
                    isSelected={tempGameStatus === option}
                    onPress={() => setTempGameStatus(option)}
                    activeColor={activeColor}
                  />
                ))}
              </View>
            </View>

            {/* By Order Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>By Order Status</Text>
              <View style={styles.filterOptions}>
                {(['All', 'Matched', 'Unmatched'] as OrderStatusFilter[]).map((option) => (
                  <FilterOption
                    key={option}
                    label={option}
                    isSelected={tempOrderStatus === option}
                    onPress={() => setTempOrderStatus(option)}
                    activeColor={activeColor}
                  />
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
              <Pressable
                style={[styles.applyButton, { backgroundColor: activeColor }]}
                onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  /* Tabs */
  tabsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 16,
  },
  tabsContainer: {
    flex: 1,
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
  filterIconButton: {
    padding: 8,
    marginBottom: 8,
  },

  /* Filter Pills */
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  filterPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },

  /* Bet Card */
  betCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 18,
    position: 'relative',
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timeAgoText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* Leg Section */
  legSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  leagueText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  gameTimeText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 'auto',
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickTeam: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pickOdds: {
    fontSize: 16,
    fontWeight: '700',
  },
  betTypeText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  matchupText: {
    color: '#666',
    fontSize: 12,
  },
  legDivider: {
    height: 1,
    backgroundColor: '#333',
    marginTop: 12,
  },

  /* Parlay Row */
  parlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#252525',
  },
  parlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  parlayOdds: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* Bottom Section */
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  wagerPayoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyIconLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wagerPayoutTexts: {
    gap: 2,
  },
  wagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wagerLabel: {
    color: '#666',
    fontSize: 12,
  },
  wagerValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payoutLabel: {
    color: '#666',
    fontSize: 12,
  },
  payoutValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  idShareSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickIdText: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
  shareButton: {
    padding: 4,
  },

  /* Perforated Edge */
  perforatedEdge: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  perforationDot: {
    width: 20,
    height: 12,
    borderRadius: 5,
    backgroundColor: '#000',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalBackdropInner: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  filterOptionWrapper: {
    flex: 1,
  },
  filterOption: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#252525',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#252525',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
