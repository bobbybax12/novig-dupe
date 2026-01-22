import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBetSlip } from '@/context/bet-slip-context';
import { useTheme } from '@/context/theme-context';
import { BlurView } from 'expo-blur';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalancePill } from './bet-slip/BalancePill';
import { CustomKeyboard } from './bet-slip/CustomKeyboard';
import {
  americanToDecimal,
  calculateTotalOdds,
  generateOrderBookLevels,
} from './bet-slip/odds-utils';
import { OddsComparison } from './bet-slip/OddsComparison';
import { OrderBook } from './bet-slip/OrderBook';

const SLIDE_DISTANCE = 70;
const COLLAPSED_HEIGHT = 56;
const TOP_MARGIN = 60;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BetLegCard = memo(function BetLegCard({
  bet,
  activeColor,
  onRemove,
  getBetTypeLabel,
}: {
  bet: any;
  activeColor: string;
  onRemove: () => void;
  getBetTypeLabel: (type: string) => string;
}) {
  return (
    <View style={styles.legCard}>
      <View style={styles.legRow}>
        <Pressable onPress={onRemove} style={styles.removeBetButton}>
          <IconSymbol size={18} name="xmark.circle.fill" color="#444" />
        </Pressable>
        <View style={styles.legInfo}>
          <View style={styles.legMainRow}>
            <Text style={styles.legTeam}>
              {bet.team}
              {bet.value && bet.type !== 'moneyline' && (
                <Text style={styles.legValueInline}> • {bet.value}</Text>
              )}
            </Text>
            <Text style={[styles.legOdds, { color: activeColor }]}>{bet.odds}</Text>
          </View>
          <View style={styles.legSubRow}>
            {bet.league && (
              <>
                <Text style={[styles.legLeague, { color: activeColor }]}>{bet.league}</Text>
                <Text style={styles.legDot}>•</Text>
              </>
            )}
            <Text style={styles.legTypeText}>{getBetTypeLabel(bet.type)}</Text>
            {bet.gameTime && (
              <>
                <Text style={styles.legDot}>•</Text>
                <Text style={styles.legTime}>{bet.gameTime}</Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

export function BetSlip() {
  const { bets, removeBet, isExpanded, setIsExpanded, placeBet } = useBetSlip();
  const { activeColor, isEnabled, deductBalance } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SLIDE_DISTANCE);
  const expandProgress = useSharedValue(0);
  const [wager, setWager] = useState('');
  const [orderType, setOrderType] = useState<'take' | 'make'>('take');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [customOdds, setCustomOdds] = useState('');
  const [editingOdds, setEditingOdds] = useState(false);
  const [selectedOddsIndex, setSelectedOddsIndex] = useState(0);
  const [effectiveOdds, setEffectiveOdds] = useState('');
  const [showOddsComparison] = useState(false);

  useEffect(() => {
    translateY.value = withTiming(bets.length > 0 ? 0 : SLIDE_DISTANCE, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [bets.length]);

  useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpanded]);

  const wagerNum = parseFloat(wager) || 0;

  useEffect(() => {
    setSelectedOddsIndex(0);
    if (bets.length === 1) {
      const levels = generateOrderBookLevels(bets[0].odds, true);
      setEffectiveOdds(levels[0].odds);
    } else {
      setEffectiveOdds('');
    }
  }, [bets.length, bets[0]?.odds]);

  useEffect(() => {
    if (bets.length === 1 && wagerNum > 0) {
      const levels = generateOrderBookLevels(bets[0].odds, true);
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].cumulativeLiquidity >= wagerNum) {
          if (i !== selectedOddsIndex) {
            setSelectedOddsIndex(i);
            setEffectiveOdds(levels[i].odds);
          }
          return;
        }
      }
      const lastIndex = levels.length - 1;
      if (lastIndex !== selectedOddsIndex) {
        setSelectedOddsIndex(lastIndex);
        setEffectiveOdds(levels[lastIndex].odds);
      }
    }
  }, [wagerNum, bets.length, bets[0]?.odds]);

  const expandedHeight = SCREEN_HEIGHT - TOP_MARGIN - insets.top;

  const animatedStyle = useAnimatedStyle(() => {
    const expanded = expandProgress.value;
    return {
      transform: [{ translateY: expanded > 0.5 ? 0 : translateY.value }],
      bottom: interpolate(expanded, [0, 1], [80, 0]),
      left: interpolate(expanded, [0, 1], [16, 0]),
      right: interpolate(expanded, [0, 1], [16, 0]),
      height: interpolate(expanded, [0, 1], [COLLAPSED_HEIGHT, expandedHeight]),
      borderTopLeftRadius: interpolate(expanded, [0, 1], [8, 20]),
      borderTopRightRadius: interpolate(expanded, [0, 1], [8, 20]),
    };
  });

  const { american: totalOdds, decimal: decimalOdds } = useMemo(
    () => calculateTotalOdds(bets),
    [bets]
  );

  const displayOdds = useMemo(() => {
    if (orderType === 'make' && customOdds) {
      return customOdds.startsWith('-') ? customOdds : '+' + customOdds;
    }
    if (bets.length === 1 && effectiveOdds) {
      return effectiveOdds;
    }
    return totalOdds;
  }, [orderType, customOdds, bets.length, effectiveOdds, totalOdds]);

  const displayDecimalOdds = useMemo(() => {
    if (orderType === 'make' && customOdds) {
      return americanToDecimal(customOdds.startsWith('-') ? customOdds : '+' + customOdds);
    }
    if (bets.length === 1 && effectiveOdds) {
      return americanToDecimal(effectiveOdds);
    }
    return decimalOdds;
  }, [orderType, customOdds, bets.length, effectiveOdds, decimalOdds]);

  const potentialPayout = wagerNum * displayDecimalOdds;

  const handlePress = useCallback(() => {
    if (!isExpanded) setIsExpanded(true);
  }, [isExpanded, setIsExpanded]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setShowKeyboard(false);
    setEditingOdds(false);
  }, [setIsExpanded]);

  const handlePlaceBet = useCallback(() => {
    if (wagerNum > 0 && bets.length > 0) {
      const currency = isEnabled ? 'usd' : 'btc';
      deductBalance(wagerNum, currency);
      placeBet(wagerNum, displayOdds, potentialPayout, currency);
      setWager('');
      setShowKeyboard(false);
      setEffectiveOdds('');
      setSelectedOddsIndex(0);
      setEditingOdds(false);
      setCustomOdds('');
    }
  }, [wagerNum, bets.length, isEnabled, deductBalance, placeBet, displayOdds, potentialPayout]);

  const handleKeyPress = useCallback((key: string) => {
    if (editingOdds) {
      if (key === '.') return;
      if (customOdds.length >= 6) return;
      setCustomOdds((prev) => prev + key);
    } else {
      setWager((prev) => {
        if (key === '.' && prev.includes('.')) return prev;
        if (prev.length >= 10) return prev;
        return prev + key;
      });
    }
  }, [editingOdds, customOdds.length]);

  const handleDelete = useCallback(() => {
    if (editingOdds) {
      setCustomOdds((prev) => prev.slice(0, -1));
    } else {
      setWager((prev) => prev.slice(0, -1));
    }
  }, [editingOdds]);

  const toggleOddsSign = useCallback(() => {
    setCustomOdds((prev) => {
      if (prev.startsWith('-')) return prev.slice(1);
      if (prev) return '-' + prev;
      return prev;
    });
  }, []);

  const handleQuickAmount = useCallback((amount: number) => {
    setWager((prev) => String((parseFloat(prev) || 0) + amount));
  }, []);

  const getBetTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'spread': return 'Spread';
      case 'total': return 'Total';
      case 'moneyline': return 'Moneyline';
      default: return type;
    }
  }, []);

  const handleOddsSelect = useCallback((index: number, odds: string) => {
    setSelectedOddsIndex(index);
    setEffectiveOdds(odds);
  }, []);

  return (
    <>
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.backdrop}>
          <Pressable style={styles.backdropPressable} onPress={handleClose}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>
        </Animated.View>
      )}
      <Animated.View style={[styles.container, animatedStyle]}>
        {!isExpanded && (
          <Pressable onPress={handlePress} style={styles.collapsedContent}>
            <View style={styles.leftSection}>
              <View style={[styles.countBadge, { backgroundColor: activeColor }]}>
                <Text style={styles.countText}>{bets.length}</Text>
              </View>
              <Text style={styles.orderSlipText}>Order Slip</Text>
            </View>
            <View style={styles.rightSection}>
              <View style={styles.oddsRow}>
                <Text style={styles.oddsLabel}>Odds </Text>
                <Text style={[styles.oddsText, { color: activeColor }]}>{displayOdds}</Text>
              </View>
              {wagerNum > 0 && (
                <Text style={styles.payoutText}>
                  ${wagerNum.toFixed(2)} → ${potentialPayout.toFixed(2)}
                </Text>
              )}
            </View>
          </Pressable>
        )}

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.handleBarContainer}>
              <View style={styles.handleBarTop} />
            </View>

            <View style={styles.expandedHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.countBadge, { backgroundColor: activeColor }]}>
                  <Text style={styles.countText}>{bets.length}</Text>
                </View>
                <Text style={styles.headerTitle}>Order Slip</Text>
              </View>
              <BalancePill />
            </View>

            <View style={styles.middleContentArea}>
              {bets.length === 1 && orderType === 'take' && showKeyboard && (
                <>
                  <OrderBook
                    bet={bets[0]}
                    activeColor={activeColor}
                    isEnabled={isEnabled}
                    wagerAmount={wagerNum}
                    onOddsSelect={handleOddsSelect}
                    selectedOddsIndex={selectedOddsIndex}
                  />
                  {showOddsComparison && (
                    <OddsComparison bet={bets[0]} displayOdds={displayOdds} activeColor={activeColor} />
                  )}
                </>
              )}

              {orderType === 'make' && bets.length > 0 && (
                <View style={styles.orderTypeSection}>
                  <View style={styles.orderTypeHeader}>
                    <Text style={styles.orderTypeTitle}>Order Type</Text>
                    <View style={styles.orderTypeToggle}>
                      <Pressable style={styles.orderTypeOption} onPress={() => { setOrderType('take'); setEditingOdds(false); }}>
                        <Text style={styles.orderTypeText}>Take</Text>
                      </Pressable>
                      <Pressable style={[styles.orderTypeOption, { backgroundColor: activeColor }]} onPress={() => setOrderType('make')}>
                        <Text style={[styles.orderTypeText, styles.orderTypeTextActive]}>Make</Text>
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.orderTypeDesc}>Set your own price and wait for someone to match.</Text>
                  <View style={styles.makeOrderSection}>
                    <Text style={styles.makeOrderLabel}>Your Odds</Text>
                    <View style={styles.makeOrderRow}>
                      <Pressable style={styles.oddsSignButton} onPress={toggleOddsSign}>
                        <Text style={[styles.oddsSignText, { color: activeColor }]}>
                          {customOdds.startsWith('-') ? '−' : '+'}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.customOddsInput, { borderColor: activeColor }, editingOdds && { backgroundColor: '#252525' }]}
                        onPress={() => { setEditingOdds(true); setShowKeyboard(true); }}>
                        <Text style={[styles.customOddsText, { color: customOdds ? '#fff' : '#666' }]}>
                          {customOdds ? (customOdds.startsWith('-') ? customOdds : '+' + customOdds) : totalOdds}
                        </Text>
                      </Pressable>
                      <View style={styles.oddsHint}>
                        <Text style={styles.oddsHintText}>Better odds = longer wait</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {!showKeyboard && (
                <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollableContentInner}>
                  {orderType === 'take' && (
                    <View style={styles.orderTypeSection}>
                      <View style={styles.orderTypeHeader}>
                        <Text style={styles.orderTypeTitle}>Order Type</Text>
                        <View style={styles.orderTypeToggle}>
                          <Pressable style={[styles.orderTypeOption, { backgroundColor: activeColor }]} onPress={() => { setOrderType('take'); setEditingOdds(false); }}>
                            <Text style={[styles.orderTypeText, styles.orderTypeTextActive]}>Take</Text>
                          </Pressable>
                          <Pressable style={styles.orderTypeOption} onPress={() => setOrderType('make')}>
                            <Text style={styles.orderTypeText}>Make</Text>
                          </Pressable>
                        </View>
                      </View>
                      <Text style={styles.orderTypeDesc}>Place an order instantly at the best available price.</Text>
                    </View>
                  )}

                  {bets.length === 1 && orderType === 'take' && (
                    <>
                      <OrderBook
                        bet={bets[0]}
                        activeColor={activeColor}
                        isEnabled={isEnabled}
                        wagerAmount={wagerNum}
                        onOddsSelect={handleOddsSelect}
                        selectedOddsIndex={selectedOddsIndex}
                      />
                      {showOddsComparison && (
                        <OddsComparison bet={bets[0]} displayOdds={displayOdds} activeColor={activeColor} />
                      )}
                    </>
                  )}

                  <View style={styles.legsInScroll}>
                    {bets.map((bet) => (
                      <BetLegCard
                        key={bet.id}
                        bet={bet}
                        activeColor={activeColor}
                        onRemove={() => removeBet(bet.id)}
                        getBetTypeLabel={getBetTypeLabel}
                      />
                    ))}
                  </View>
                </ScrollView>
              )}

              <View style={styles.wagerSection}>
                <View style={styles.wagerInputRow}>
                  {[10, 25, 50].map((amount) => (
                    <Pressable key={amount} style={[styles.quickAmountButton, { borderColor: activeColor }]} onPress={() => handleQuickAmount(amount)}>
                      <View style={styles.quickAmountContent}>
                        <Text style={[styles.quickAmountPlus, { color: activeColor }]}>+</Text>
                        <Text style={[styles.quickAmountText, { color: activeColor }]}>{amount}</Text>
                      </View>
                    </Pressable>
                  ))}
                  <View style={styles.wagerRightColumn}>
                    <Pressable style={[styles.wagerInputContainer, { borderColor: activeColor }]} onPress={() => { setEditingOdds(false); setShowKeyboard(true); }}>
                      <View style={[styles.wagerIcon, { backgroundColor: activeColor }]}>
                        <IconSymbol size={12} name={isEnabled ? 'dollarsign' : 'bitcoinsign'} color="#000" />
                      </View>
                      <Text style={[styles.wagerInputText, !wager && styles.wagerPlaceholder]}>{wager || '0'}</Text>
                    </Pressable>
                    <View style={styles.payoutDisplay}>
                      <Text style={styles.payoutLabel}>Payout:</Text>
                      <Text style={[styles.payoutValue, { color: activeColor }]}>{potentialPayout.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.keyboardToggleRow}>
                  <View style={styles.keyboardToggleLine} />
                  <Pressable style={[styles.keyboardToggle, { borderColor: activeColor }]} onPress={() => setShowKeyboard(!showKeyboard)}>
                    <IconSymbol size={18} name={showKeyboard ? 'chevron.down' : 'chevron.up'} color={activeColor} />
                  </Pressable>
                  <View style={styles.keyboardToggleLine} />
                </View>

                <CustomKeyboard onKeyPress={handleKeyPress} onDelete={handleDelete} visible={showKeyboard} activeColor={activeColor} />
              </View>
            </View>

            <View style={[styles.actionSection, { paddingBottom: insets.bottom + 16 }]}>
              <Pressable
                style={[styles.placeBetButton, wagerNum > 0 ? styles.placeBetButtonActive : styles.placeBetButtonDisabled]}
                onPress={handlePlaceBet}
                disabled={wagerNum <= 0}>
                <Text style={[styles.placeBetText, wagerNum > 0 ? styles.placeBetTextActive : styles.placeBetTextDisabled]}>
                  {wagerNum > 0 ? 'Place Bet' : 'Enter Wager Amount'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backdropPressable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    backgroundColor: '#1a1a1a',
    zIndex: 2,
    overflow: 'hidden',
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: COLLAPSED_HEIGHT,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  orderSlipText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oddsLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  oddsText: {
    fontSize: 16,
    fontWeight: '700',
  },
  payoutText: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  expandedContent: {
    flex: 1,
  },
  middleContentArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBarTop: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  orderTypeSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  orderTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderTypeTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  orderTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderTypeOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  orderTypeText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  orderTypeTextActive: {
    color: '#000',
  },
  orderTypeDesc: {
    color: '#666',
    paddingVertical: 6,
    fontSize: 12,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentInner: {
    paddingBottom: 8,
  },
  legsInScroll: {
    paddingHorizontal: 16,
  },
  legCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    paddingVertical: 12,
  },
  legRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  removeBetButton: {
    padding: 2,
    marginTop: 2,
  },
  legInfo: {
    flex: 1,
  },
  legMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  legTeam: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  legOdds: {
    fontSize: 16,
    fontWeight: '700',
  },
  legSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legTypeText: {
    color: '#888',
    fontSize: 13,
  },
  legDot: {
    color: '#555',
    fontSize: 10,
  },
  legLeague: {
    fontSize: 13,
    fontWeight: '600',
  },
  legValueInline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legTime: {
    color: '#888',
    fontSize: 13,
  },
  wagerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  wagerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  wagerRightColumn: {
    alignItems: 'flex-end',
  },
  wagerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  wagerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wagerInputText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'right',
  },
  wagerPlaceholder: {
    color: '#666',
  },
  payoutDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  payoutLabel: {
    color: '#666',
    fontSize: 13,
  },
  payoutValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickAmountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 22.5,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  quickAmountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quickAmountPlus: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  keyboardToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  keyboardToggleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  keyboardToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSection: {
    paddingHorizontal: 16,
  },
  placeBetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  placeBetButtonActive: {
    backgroundColor: '#fff',
  },
  placeBetButtonDisabled: {
    backgroundColor: '#333',
  },
  placeBetText: {
    fontSize: 16,
    fontWeight: '700',
  },
  placeBetTextActive: {
    color: '#000',
  },
  placeBetTextDisabled: {
    color: '#666',
  },
  makeOrderSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#252525',
    borderRadius: 10,
  },
  makeOrderLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  makeOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oddsSignButton: {
    width: 44,
    height: 44,
    backgroundColor: '#252525',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  oddsSignText: {
    fontSize: 24,
    fontWeight: '600',
  },
  customOddsInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
  },
  customOddsText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  oddsHint: {
    flex: 1,
    marginLeft: 12,
  },
  oddsHintText: {
    color: '#666',
    fontSize: 11,
  },
});
