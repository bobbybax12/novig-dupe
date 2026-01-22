// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * SF Symbols to Material Icons mappings.
 */
const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.seal.fill': 'verified',
  'checkmark.circle': 'check-circle',
  'dollarsign': 'attach-money',
  'bitcoinsign': 'currency-bitcoin',
  'basketball.fill': 'sports-basketball',
  'football.fill': 'sports-football',
  'hockey.puck.fill': 'sports-hockey',
  'sportscourt.fill': 'sports',
  'person.fill': 'person',
  'gearshape.fill': 'settings',
  'gift.fill': 'card-giftcard',
  'star.fill': 'star',
  'doc.text': 'description',
  'arrow.right': 'arrow-forward',
  'delete.left': 'backspace',
  'line.3.horizontal.decrease': 'filter-list',
  'square.and.arrow.up': 'share',
  'trophy.fill': 'emoji-events',
  'flame.fill': 'whatshot',
  'pencil': 'edit',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
};

/**
 * An icon component that uses Material Icons with SF Symbol name mapping.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
