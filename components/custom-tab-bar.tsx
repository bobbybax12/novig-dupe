import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabBarItem {
  name: string;
  label: string;
  icon: string;
}

const TAB_ITEMS: TabBarItem[] = [
  { name: 'index', label: 'Events', icon: 'calendar' },
  { name: 'Rewards', label: 'Rewards', icon: 'star.fill' },
  { name: 'Portfolio', label: 'Portfolio', icon: 'briefcase.fill' },
  { name: 'Account', label: 'Account', icon: 'person.fill' },
];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(TAB_ITEMS[0].name)}
          activeOpacity={0.7}>
          <IconSymbol
            size={24}
            name={TAB_ITEMS[0].icon}
            color={state.index === 0 ? colors.tint : colors.tabIconDefault}
          />
          <Text
            style={[
              styles.label,
              { color: state.index === 0 ? colors.tint : colors.tabIconDefault },
            ]}>
            {TAB_ITEMS[0].label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(TAB_ITEMS[1].name)}
          activeOpacity={0.7}>
          <IconSymbol
            size={24}
            name={TAB_ITEMS[1].icon}
            color={state.index === 1 ? colors.tint : colors.tabIconDefault}
          />
          <Text
            style={[
              styles.label,
              { color: state.index === 1 ? colors.tint : colors.tabIconDefault },
            ]}>
            {TAB_ITEMS[1].label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(TAB_ITEMS[2].name)}
          activeOpacity={0.7}>
          <IconSymbol
            size={24}
            name={TAB_ITEMS[2].icon}
            color={state.index === 2 ? colors.tint : colors.tabIconDefault}
          />
          <Text
            style={[
              styles.label,
              { color: state.index === 2 ? colors.tint : colors.tabIconDefault },
            ]}>
            {TAB_ITEMS[2].label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate(TAB_ITEMS[3].name)}
          activeOpacity={0.7}>
          <IconSymbol
            size={24}
            name={TAB_ITEMS[3].icon}
            color={state.index === 3 ? colors.tint : colors.tabIconDefault}
          />
          <Text
            style={[
              styles.label,
              { color: state.index === 3 ? colors.tint : colors.tabIconDefault },
            ]}>
            {TAB_ITEMS[3].label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    zIndex: 10,
    elevation: 10,
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});
