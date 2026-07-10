import { theme } from '@/constants/Theme';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

type PatternFolderCardProps = {
  title: string;
  count: number;
  icon: React.ComponentProps<typeof SymbolView>['name'];
  accentColor: string;
  backgroundColor: string;
  onPress: () => void;
};

export default function PatternFolderCard({
  title,
  count,
  icon,
  accentColor,
  backgroundColor,
  onPress,
}: PatternFolderCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${count} patterns`}>
      <View
        style={{
          minHeight: 208,
          borderRadius: 30,
          borderCurve: 'continuous',
          backgroundColor,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.72)',
          padding: 20,
          justifyContent: 'space-between',
          boxShadow: '0 14px 30px rgba(18, 20, 14, 0.06)',
        }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.72)',
          }}>
          <SymbolView name={icon} size={30} tintColor={accentColor} weight="semibold" />
        </View>

        <View style={{ gap: 8 }}>
          <Text
            selectable
            numberOfLines={2}
            style={{
              fontSize: 22,
              lineHeight: 26,
              fontWeight: theme.weight.black,
              color: theme.colors.textPrimary,
            }}>
            {title}
          </Text>
          <Text
            selectable
            style={{
              fontSize: 19,
              fontWeight: theme.weight.semibold,
              color: theme.colors.textSecondary,
            }}>
            {count} {count === 1 ? 'pattern' : 'patterns'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <View
            style={{
              height: 8,
              flex: 1,
              borderRadius: theme.radius.pill,
              backgroundColor: 'rgba(255,255,255,0.58)',
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${Math.max(0.22, Math.min(1, count / 12)) * 100}%`,
                height: '100%',
                borderRadius: theme.radius.pill,
                backgroundColor: accentColor,
              }}
            />
          </View>
          <SymbolView name="chevron.right" size={14} tintColor={theme.colors.textSecondary} />
        </View>
      </View>
    </Pressable>
  );
}
