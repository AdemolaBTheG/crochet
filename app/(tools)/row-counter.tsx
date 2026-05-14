import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { Host, Picker, Text as SwiftText } from '@expo/ui/swift-ui';
import {
  Animation,
  animation,
  contentTransition,
  font,
  foregroundStyle,
  monospacedDigit,
  pickerStyle,
  tag,
} from '@expo/ui/swift-ui/modifiers';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CounterKind = 'rows' | 'rounds';

function CounterModePicker({
  activeCounter,
  onChange,
}: {
  activeCounter: CounterKind;
  onChange: (counter: CounterKind) => void;
}) {
  const { t } = useTranslation();
  const isIOS = process.env.EXPO_OS === 'ios';

  if (isIOS) {
    return (
      <Host matchContents useViewportSizeMeasurement>
        <Picker<CounterKind>
          selection={activeCounter}
          onSelectionChange={onChange}
          modifiers={[pickerStyle('segmented')]}>
          <SwiftText modifiers={[tag('rows')]}>{t('tools.rowCounter.mode.rows')}</SwiftText>
          <SwiftText modifiers={[tag('rounds')]}>{t('tools.rowCounter.mode.rounds')}</SwiftText>
        </Picker>
      </Host>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing.xs,
        padding: theme.spacing.xs,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.muted,
      }}>
      {([
        { value: 'rows', label: t('tools.rowCounter.mode.rows') },
        { value: 'rounds', label: t('tools.rowCounter.mode.rounds') },
      ] as const).map((option) => {
        const isSelected = option.value === activeCounter;

        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: 40,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isSelected ? theme.colors.primary : 'transparent',
            }}>
            <Text
              selectable={false}
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: isSelected ? theme.colors.white : theme.colors.textSecondary,
              }}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

function NumericCount({ value }: { value: number }) {
  const isIOS = process.env.EXPO_OS === 'ios';

  if (isIOS) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Host matchContents useViewportSizeMeasurement>
          <SwiftText
            modifiers={[
              font({ size: 76, weight: 'black', design: 'rounded' }),
              monospacedDigit(),
              foregroundStyle(theme.colors.textPrimary),
              contentTransition('numericText'),
              animation(Animation.spring({ duration: 0.28, bounce: 0.18 }), value),
            ]}>
            {value}
          </SwiftText>
        </Host>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        selectable={false}
        style={{
          fontSize: 76,
          fontWeight: theme.weight.black,
          color: theme.colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}>
        {value}
      </Text>
    </View>
  );
}

function CounterButton({
  label,
  icon,
  onPress,
  variant,
}: {
  label: string;
  icon: React.ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isPrimary ? theme.colors.primary : theme.colors.primarySoft,
      }}>
      <SymbolView
        name={icon}
        size={24}
        weight="bold"
        tintColor={isPrimary ? theme.colors.white : theme.colors.primary}
        fallback={
          <Text
            style={{
              color: isPrimary ? theme.colors.white : theme.colors.primary,
              fontSize: theme.size.lg,
              fontWeight: theme.weight.bold,
            }}>
            {label}
          </Text>
        }
      />
    </PressableScale>
  );
}

function CounterCard({ activeCounter, value }: { activeCounter: CounterKind; value: number }) {
  const { t } = useTranslation();

  const label =
    activeCounter === 'rows'
      ? t('tools.rowCounter.copy.rows.label')
      : t('tools.rowCounter.copy.rounds.label');
  const helper =
    activeCounter === 'rows'
      ? t('tools.rowCounter.copy.rows.helper')
      : t('tools.rowCounter.copy.rounds.helper');

  return (
    <View
      style={{
        padding: theme.spacing['2xl'],
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.lg,
      }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
        <Text
          selectable
          style={{
            fontSize: theme.size.sm,
            fontWeight: theme.weight.bold,
            color: theme.colors.primary,
            textTransform: 'uppercase',
          }}>
          {label}
        </Text>

        <NumericCount value={value} />

        <Text
          selectable
          style={{
            fontSize: theme.size.sm,
            color: theme.colors.textSecondary,
            textAlign: 'center',
          }}>
          {helper}
        </Text>
      </View>
    </View>
  );
}

export default function RowCounterScreen() {
  const { t } = useTranslation();
  const isPro = usePremiumGate();
  const insets = useSafeAreaInsets();
  const [activeCounter, setActiveCounter] = useState<CounterKind>('rows');
  const [rows, setRows] = useState(0);
  const [rounds, setRounds] = useState(0);
  const activeValue = activeCounter === 'rows' ? rows : rounds;

  function changeCounter(counter: CounterKind) {
    if (counter === activeCounter) return;

    void Haptics.selectionAsync();
    setActiveCounter(counter);
  }

  function updateActiveCounter(delta: number) {
    void Haptics.selectionAsync();

    if (activeCounter === 'rows') {
      setRows((current) => Math.max(0, current + delta));
      return;
    }

    setRounds((current) => Math.max(0, current + delta));
  }

  function resetActiveCounter() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (activeCounter === 'rows') {
      setRows(0);
      return;
    }

    setRounds(0);
  }

  if (!isPro) return null;

  const decreaseLabel =
    activeCounter === 'rows'
      ? t('tools.rowCounter.actions.decreaseRows')
      : t('tools.rowCounter.actions.decreaseRounds');
  const increaseLabel =
    activeCounter === 'rows'
      ? t('tools.rowCounter.actions.increaseRows')
      : t('tools.rowCounter.actions.increaseRounds');
  const resetLabel =
    activeCounter === 'rows'
      ? t('tools.rowCounter.actions.resetRows')
      : t('tools.rowCounter.actions.resetRounds');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}>
        <CounterModePicker activeCounter={activeCounter} onChange={changeCounter} />

        <CounterCard activeCounter={activeCounter} value={activeValue} />
      </View>

      <View
        style={{
          marginTop: 'auto',
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xl,
          gap: theme.spacing.md,
        }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <CounterButton
            label={decreaseLabel}
            icon={{ ios: 'minus', android: 'remove', web: 'remove' }}
            onPress={() => updateActiveCounter(-1)}
            variant="secondary"
          />
          <CounterButton
            label={increaseLabel}
            icon={{ ios: 'plus', android: 'add', web: 'add' }}
            onPress={() => updateActiveCounter(1)}
            variant="primary"
          />
        </View>

        <PressableScale
          onPress={resetActiveCounter}
          accessibilityRole="button"
          accessibilityLabel={resetLabel}
          style={{
            minHeight: 52,
            borderRadius: theme.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.muted,
          }}>
          <Text
            selectable
            style={{
              fontSize: theme.size.md,
              fontWeight: theme.weight.semibold,
              color: theme.colors.textSecondary,
              textTransform: 'capitalize',
            }}>
            {resetLabel}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
