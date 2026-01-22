import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { AppHeader } from '@/components/app-header';
import { BetSlip } from '@/components/bet-slip';
import { BetConfirmation } from '@/components/bet-confirmation';
import { ThemeProvider } from '@/context/theme-context';
import { BetSlipProvider, useBetSlip } from '@/context/bet-slip-context';

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { isExpanded } = useBetSlip();

  return (
    <View style={styles.container}>
      <AppHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
        tabBar={(props) => isExpanded ? null : <CustomTabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{ title: 'Events' }}
        />
        <Tabs.Screen
          name="Rewards"
          options={{ title: 'Rewards' }}
        />
        <Tabs.Screen
          name="Portfolio"
          options={{ title: 'Portfolio' }}
        />
        <Tabs.Screen
          name="Account"
          options={{ title: 'Account' }}
        />
      </Tabs>
      <BetSlip />
      <BetConfirmation />
    </View>
  );
}

export default function TabLayout() {
  return (
    <ThemeProvider>
      <BetSlipProvider>
        <TabLayoutContent />
      </BetSlipProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
