import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/context/theme-context';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type TabType = 'Rewards' | 'Leaderboard';

export default function RewardsScreen() {
  const { activeColor } = useTheme();
  const [selectedTab, setSelectedTab] = useState<TabType>('Rewards');

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysUntilReset = daysInMonth - currentDay;
  const timeProgress = Math.round((currentDay / daysInMonth) * 100);

  const earnedAmount = 45;
  const totalAmount = 250;
  const earnedProgress = Math.round((earnedAmount / totalAmount) * 100);

  const currentStreak = 5;
  const friendsReferred = 0;
  const referralEarned = 0;

  const milestones = [
    { days: 5, reward: 1, reached: currentStreak >= 5 },
    { days: 15, reward: 3, reached: currentStreak >= 15 },
    { days: 25, reward: 6, reached: currentStreak >= 25 },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Alex M.', amount: 2450, isYou: false },
    { rank: 2, name: 'Sarah K.', amount: 1820, isYou: false },
    { rank: 3, name: 'Mike R.', amount: 1540, isYou: false },
    { rank: 4, name: 'You', amount: 0, isYou: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'Rewards' && { backgroundColor: activeColor }]}
          onPress={() => setSelectedTab('Rewards')}>
          <Text style={[styles.tabText, selectedTab === 'Rewards' && styles.tabTextActive]}>
            Rewards
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'Leaderboard' && { backgroundColor: activeColor }]}
          onPress={() => setSelectedTab('Leaderboard')}>
          <Text style={[styles.tabText, selectedTab === 'Leaderboard' && styles.tabTextActive]}>
            Leaderboard
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {selectedTab === 'Rewards' && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.countdownCard}>
              <View style={styles.countdownHeader}>
                <View>
                  <Text style={styles.countdownLabel}>Monthly Reset</Text>
                  <Text style={styles.countdownValue}>{daysUntilReset} days</Text>
                </View>
                <View style={styles.progressCircleContainer}>
                  <View style={styles.progressCircleBg} />
                  <View style={[styles.progressCircleTrack, { borderColor: activeColor, opacity: 0.3 }]} />
                  <View
                    style={[
                      styles.progressCircleArc,
                      {
                        borderTopColor: activeColor,
                        borderRightColor: earnedProgress > 25 ? activeColor : 'transparent',
                        borderBottomColor: earnedProgress > 50 ? activeColor : 'transparent',
                        borderLeftColor: earnedProgress > 75 ? activeColor : 'transparent',
                      }
                    ]}
                  />
                  <View style={styles.progressCircleInner}>
                    <Text style={[styles.progressText, { color: activeColor }]}>{earnedProgress}%</Text>
                  </View>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${earnedProgress}%`, backgroundColor: activeColor }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={[styles.earnedText, { color: activeColor }]}>${earnedAmount} earned</Text>
                  <Text style={styles.totalText}>${totalAmount} max</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <IconSymbol size={20} name="gift.fill" color={activeColor} />
                </View>
                <View style={styles.cardTitleSection}>
                  <Text style={styles.cardTitle}>Refer a Friend</Text>
                  <Text style={styles.cardSubtitle}>Give $25, Get $25</Text>
                </View>
              </View>

              <View style={styles.referralStats}>
                <View style={styles.referralStat}>
                  <Text style={styles.referralStatValue}>{friendsReferred}</Text>
                  <Text style={styles.referralStatLabel}>Referred</Text>
                </View>
                <View style={styles.referralStatDivider} />
                <View style={styles.referralStat}>
                  <Text style={[styles.referralStatValue, { color: activeColor }]}>${referralEarned}</Text>
                  <Text style={styles.referralStatLabel}>Earned</Text>
                </View>
              </View>

              <Pressable style={[styles.shareButton, { backgroundColor: activeColor }]}>
                <IconSymbol size={16} name="square.and.arrow.up" color="#000" />
                <Text style={styles.shareButtonText}>Share Referral Link</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <IconSymbol size={20} name="flame.fill" color="#FF6B35" />
                </View>
                <View style={styles.cardTitleSection}>
                  <Text style={styles.cardTitle}>Daily Streak</Text>
                  <Text style={styles.cardSubtitle}>Login daily for rewards</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>{currentStreak} days</Text>
                </View>
              </View>

              <View style={styles.milestonesContainer}>
                {milestones.map((milestone, index) => (
                  <View key={milestone.days} style={styles.milestoneItem}>
                    {index === 0 && (
                      <View style={[
                        styles.milestoneLineLeft,
                        milestone.reached && styles.milestoneLineActive
                      ]} />
                    )}
                    <View style={[
                      styles.milestoneCircle,
                      milestone.reached && styles.milestoneReached,
                      index === 0 && currentStreak > 0 && currentStreak < milestone.days && styles.milestoneInProgress
                    ]}>
                      <IconSymbol
                        size={18}
                        name="flame.fill"
                        color={milestone.reached ? '#fff' : currentStreak > 0 && index === 0 ? '#FF6B35' : '#444'}
                      />
                    </View>
                    <Text style={styles.milestoneDays}>{milestone.days}d</Text>
                    <Text style={[styles.milestoneReward, { color: activeColor }]}>${milestone.reward}</Text>
                    {index < milestones.length - 1 && (
                      <View style={[
                        styles.milestoneLineRight,
                        milestones[index + 1].reached && styles.milestoneLineActive
                      ]} />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.streakStatus}>
                <View style={[styles.statusDot, { backgroundColor: '#FF6B35' }]} />
                <Text style={styles.statusText}>Challenge in progress</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {selectedTab === 'Leaderboard' && (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>This Month</Text>
              <Text style={styles.leaderboardSubtitle}>Top earners by profit</Text>
            </View>

            <View style={styles.leaderboardCard}>
              {leaderboardData.map((item, index) => (
                <View
                  key={item.rank}
                  style={[
                    styles.leaderboardRow,
                    item.isYou && styles.leaderboardRowYou,
                    index > 0 && styles.leaderboardRowBorder
                  ]}>
                  <View style={styles.leaderboardLeft}>
                    <View style={[
                      styles.rankBadge,
                      item.rank === 1 && styles.rankGold,
                      item.rank === 2 && styles.rankSilver,
                      item.rank === 3 && styles.rankBronze,
                    ]}>
                      <Text style={styles.rankText}>{item.rank}</Text>
                    </View>
                    <Text style={[styles.leaderboardName, item.isYou && { color: activeColor }]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.leaderboardAmount, item.isYou && { color: activeColor }]}>
                    ${item.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.motivationCard}>
              <IconSymbol size={24} name="trophy.fill" color="#FFD700" />
              <Text style={styles.motivationText}>Place more bets to climb the leaderboard!</Text>
            </View>
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  countdownCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownLabel: {
    color: '#888',
    fontSize: 13,
  },
  countdownValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  progressCircleContainer: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  progressCircleBg: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#252525',
  },
  progressCircleTrack: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
  },
  progressCircleArc: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'transparent',
    transform: [{ rotate: '-135deg' }],
  },
  progressCircleInner: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {},
  progressBarBg: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earnedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalText: {
    color: '#666',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleSection: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  referralStats: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  referralStat: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  referralStatLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  referralStatDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '700',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  milestoneItem: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  milestoneCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#252525',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  milestoneReached: {
    backgroundColor: '#FF6B35',
  },
  milestoneInProgress: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  milestoneDays: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  milestoneReward: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  milestoneLineLeft: {
    position: 'absolute',
    top: 14,
    right: '50%',
    width: '50%',
    height: 16,
    backgroundColor: '#333',
    zIndex: 1,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  milestoneLineRight: {
    position: 'absolute',
    top: 14,
    left: '50%',
    width: '100%',
    height: 16,
    backgroundColor: '#333',
    zIndex: 1,
  },
  milestoneLineActive: {
    backgroundColor: '#FF6B35',
  },
  streakStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#888',
    fontSize: 13,
  },
  leaderboardHeader: {
    marginBottom: 16,
  },
  leaderboardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  leaderboardSubtitle: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  leaderboardCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leaderboardRowYou: {
    backgroundColor: '#252525',
  },
  leaderboardRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#252525',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  leaderboardName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  leaderboardAmount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  motivationText: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
});
