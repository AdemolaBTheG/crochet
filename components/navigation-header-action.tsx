import { theme } from '@/constants/Theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';

type HeaderActionIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function NavigationHeaderAction({
  label,
  onPress,
  icon,
  variant = 'plain',
  compact = false,
}: {
  label: string;
  onPress: () => void;
  icon?: HeaderActionIcon;
  variant?: 'plain' | 'prominent';
  compact?: boolean;
}) {
  const isProminent = variant === 'prominent';
  const textColor = isProminent ? theme.colors.white : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={{
        minHeight: 36,
        minWidth: compact ? 36 : undefined,
        paddingHorizontal: compact ? theme.spacing.sm : theme.spacing.md,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: theme.spacing.xs,
        backgroundColor: isProminent ? theme.colors.primary : 'transparent',
      }}>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={compact ? 20 : 18}
          color={textColor}
        />
      ) : null}
      {!compact ? (
        <Text
          style={{
            fontSize: theme.size.md,
            fontWeight: theme.weight.semibold,
            color: textColor,
          }}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
