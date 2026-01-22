import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type TabType = 'Stats' | 'Transactions';

export default function AccountScreen() {
  const { activeColor, isEnabled, cashBalance, coinsBalance, showBalance, setShowBalance } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Stats');

  const indicatorStyle = useAnimatedStyle(() => ({
    left: withTiming(selectedTab === 'Stats' ? '0%' : '50%', { duration: 200 }),
  }));

  const historyData = [
    { period: 'Today', wins: 0, losses: 0, pushes: 0, amount: 0.00 },
    { period: 'Yesterday', wins: 0, losses: 0, pushes: 0, amount: 0.00 },
    { period: 'This Week', wins: 2, losses: 1, pushes: 0, amount: 45.50 },
    { period: 'This Month', wins: 8, losses: 5, pushes: 1, amount: 125.00 },
    { period: 'All Time', wins: 24, losses: 18, pushes: 3, amount: 342.75 },
  ];

  const coinsColor = '#FFD700';
  const cashColor = '#5AC8FA';

  const formatCash = () => {
    if (!showBalance) return '•••••';
    return '$' + cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const formatCoins = () => {
    if (!showBalance) return '•••••';
    return coinsBalance.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <IconSymbol size={40} name="person.fill" color="#888" />
              </View>
              <Pressable style={[styles.editButton, { backgroundColor: activeColor }]}>
                <IconSymbol size={10} name="pencil" color="#000" />
              </Pressable>
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.userName}>Robert Baxter</Text>
              <Text style={styles.memberSince}>Member since Jan 2026</Text>
            </View>
          </View>

          <View style={styles.balancesContainer}>
            <Pressable style={styles.eyeButton} onPress={() => setShowBalance(!showBalance)}>
              <IconSymbol size={18} name={showBalance ? 'eye' : 'eye.slash'} color="#666" />
            </Pressable>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Coins</Text>
              <View style={styles.balanceValueRow}>
                <View style={[styles.balanceIcon, { backgroundColor: coinsColor }]}>
                  <IconSymbol size={12} name="bitcoinsign" color="#000" />
                </View>
                <Text style={[styles.balanceValue, { color: coinsColor }]}>
                  {formatCoins()}
                </Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Cash</Text>
              <View style={styles.balanceValueRow}>
                <View style={[styles.balanceIcon, { backgroundColor: cashColor }]}>
                  <IconSymbol size={12} name="dollarsign" color="#000" />
                </View>
                <Text style={[styles.balanceValue, { color: cashColor }]}>
                  {formatCash()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={styles.secondaryButton}>
            <IconSymbol size={18} name="arrow.right" color="#fff" />
            <Text style={styles.secondaryButtonText}>Redeem</Text>
          </Pressable>
          <Pressable style={[styles.primaryButton, { backgroundColor: activeColor }]}>
            <IconSymbol size={18} name="dollarsign" color="#000" />
            <Text style={styles.primaryButtonText}>Add Funds</Text>
          </Pressable>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabsRow}>
            {(['Stats', 'Transactions'] as TabType[]).map((tab) => (
              <Pressable
                key={tab}
                style={styles.tab}
                onPress={() => setSelectedTab(tab)}>
                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.tabLine}>
            <Animated.View
              style={[styles.tabIndicator, { backgroundColor: activeColor }, indicatorStyle]}
            />
          </View>
        </View>

        {selectedTab === 'Stats' && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.statsOverview}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>18</Text>
                <Text style={styles.statLabel}>Losses</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>57%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>

            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Performance</Text>
                <Pressable>
                  <Text style={[styles.linkText, { color: activeColor }]}>% ROI</Text>
                </Pressable>
              </View>

              {historyData.map((item, index) => (
                <View
                  key={item.period}
                  style={[styles.historyRow, index === 0 && styles.historyRowFirst]}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyPeriod}>{item.period}</Text>
                    <Text style={styles.historyRecord}>
                      {item.wins}-{item.losses}-{item.pushes}
                    </Text>
                  </View>
                  <Text style={[
                    styles.historyAmount,
                    item.amount > 0 ? styles.positiveAmount : styles.neutralAmount
                  ]}>
                    {item.amount > 0 ? '+' : ''}{isEnabled ? '$' : '₿'}{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {selectedTab === 'Transactions' && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <IconSymbol size={32} name="doc.text" color="#444" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtext}>Your deposits and withdrawals will appear here</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    marginLeft: 16,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  memberSince: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  balancesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 16,
  },
  balanceCard: {
    flex: 1,
  },
  balanceLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  eyeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    zIndex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  tabsContainer: {
    marginBottom: 20,
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
  tabTextActive: {
    color: '#fff',
  },
  tabLine: {
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: 3,
    borderRadius: 2,
  },
  statsOverview: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  historySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  historyRowFirst: {
    borderTopWidth: 0,
  },
  historyLeft: {},
  historyPeriod: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  historyRecord: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  positiveAmount: {
    color: '#22c55e',
  },
  neutralAmount: {
    color: '#888',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
});
