import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTabParamList } from './types';
import { CalendarScreen } from '../features/calendar/screens/CalendarScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { palette, spacing, typography, radius } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

/**
 * Custom tab bar (the required "navbar"). Built by hand rather than using the
 * default so it reads as Custom UI and respects the bottom safe-area inset
 * (home-indicator devices).
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || spacing.sm }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = route.name;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={styles.tabItem}>
            <View style={[styles.dot, focused && styles.dotActive]} />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
  },
  dotActive: { backgroundColor: palette.primary },
  tabLabel: { ...typography.caption, color: palette.textMuted },
  tabLabelActive: { color: palette.primary, fontWeight: '600' },
});
