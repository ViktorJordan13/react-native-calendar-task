import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { palette, spacing } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /**
   * Which edges to pad for safe areas. Default pads top + bottom so content
   * never sits under a notch, Dynamic Island, or home indicator.
   * Screens with their own header can pass ['bottom'] to let the header
   * own the top inset.
   */
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

/**
 * Every screen renders inside this wrapper. Centralizing safe-area handling
 * here is what satisfies the "display correctly with all types of notches"
 * requirement — we read real device insets rather than hardcoding offsets.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
  backgroundColor = palette.background,
}) => {
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[styles.root, { backgroundColor }, padding, style]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
