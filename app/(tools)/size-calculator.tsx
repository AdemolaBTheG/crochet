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
import { usePreventZoomTransitionDismissal } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

type Unit = 'cm' | 'in';

type CalculatorValues = {
  gaugeStitches: string;
  gaugeRows: string;
  gaugeWidth: string;
  gaugeHeight: string;
  targetWidth: string;
  targetHeight: string;
};

const initialValues: CalculatorValues = {
  gaugeStitches: '',
  gaugeRows: '',
  gaugeWidth: '',
  gaugeHeight: '',
  targetWidth: '',
  targetHeight: '',
};

function parseDecimal(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function UnitPicker({ unit, onChange }: { unit: Unit; onChange: (unit: Unit) => void }) {
  const { t } = useTranslation();
  const isIOS = process.env.EXPO_OS === 'ios';

  if (isIOS) {
    return (
      <Host matchContents useViewportSizeMeasurement>
        <Picker<Unit>
          selection={unit}
          onSelectionChange={onChange}
          modifiers={[pickerStyle('segmented')]}>
          <SwiftText modifiers={[tag('cm')]}>{t('tools.sizeCalculator.units.cm')}</SwiftText>
          <SwiftText modifiers={[tag('in')]}>{t('tools.sizeCalculator.units.in')}</SwiftText>
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
      {(
        [
          { value: 'cm', label: t('tools.sizeCalculator.units.cm') },
          { value: 'in', label: t('tools.sizeCalculator.units.in') },
        ] as const
      ).map((option) => {
        const isSelected = option.value === unit;

        return (
          <Animated.Pressable
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
          </Animated.Pressable>
        );
      })}
    </View>
  );
}

function AnimatedResultNumber({ value }: { value: number }) {
  const isIOS = process.env.EXPO_OS === 'ios';

  if (isIOS) {
    return (
      <Host matchContents={{ vertical: true, horizontal: true }}>
        <SwiftText
          modifiers={[
            font({ size: 34, weight: 'black', design: 'rounded' }),
            monospacedDigit(),
            foregroundStyle(theme.colors.textPrimary),
            contentTransition('numericText'),
            animation(Animation.spring({ duration: 0.28, bounce: 0.14 }), value),
          ]}>
          {value}
        </SwiftText>
      </Host>
    );
  }

  return (
    <Text
      selectable={false}
      style={{
        fontSize: 34,
        fontWeight: theme.weight.black,
        color: theme.colors.textPrimary,
        fontVariant: ['tabular-nums'],
      }}>
      {value}
    </Text>
  );
}

function CalculatorInput({
  label,
  value,
  onChangeText,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  suffix?: string;
}) {
  return (
    <View style={{ flex: 1, gap: theme.spacing.xs }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.sm,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textSecondary,
        }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.muted,
        }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={theme.colors.textTertiary}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.md,
            color: theme.colors.textPrimary,
            fontSize: theme.size.lg,
            fontWeight: theme.weight.semibold,
          }}
        />
        {suffix ? (
          <Text
            selectable
            style={{
              fontSize: theme.size.sm,
              color: theme.colors.textSecondary,
            }}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ResultTile({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        padding: theme.spacing.lg,
        alignItems: 'center',
        gap: theme.spacing.xs,
      }}>
      <AnimatedResultNumber value={value} />
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.semibold,
          color: theme.colors.primary,
        }}>
        {label}
      </Text>
    </View>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.md,
      }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.bold,
          color: theme.colors.textPrimary,
        }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function SizeCalculatorScreen() {
  const { t } = useTranslation();
  usePreventZoomTransitionDismissal();

  const isPro = usePremiumGate();
  const [unit, setUnit] = useState<Unit>('cm');
  const [values, setValues] = useState<CalculatorValues>(initialValues);

  const result = useMemo(() => {
    const gaugeStitches = parseDecimal(values.gaugeStitches);
    const gaugeRows = parseDecimal(values.gaugeRows);
    const gaugeWidth = parseDecimal(values.gaugeWidth);
    const gaugeHeight = parseDecimal(values.gaugeHeight);
    const targetWidth = parseDecimal(values.targetWidth);
    const targetHeight = parseDecimal(values.targetHeight);

    if (
      !gaugeStitches ||
      !gaugeRows ||
      !gaugeWidth ||
      !gaugeHeight ||
      !targetWidth ||
      !targetHeight
    ) {
      return null;
    }

    return {
      stitches: Math.round((gaugeStitches / gaugeWidth) * targetWidth),
      rows: Math.round((gaugeRows / gaugeHeight) * targetHeight),
    };
  }, [values]);

  function updateValue(key: keyof CalculatorValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;

    void Haptics.selectionAsync();
    setUnit(nextUnit);
  }

  if (!isPro) return null;

  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <UnitPicker unit={unit} onChange={changeUnit} />
      </View>

      <FormCard title={t('tools.sizeCalculator.sections.gauge')}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.stitches')}
            value={values.gaugeStitches}
            onChangeText={(value) => updateValue('gaugeStitches', value)}
          />
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.rows')}
            value={values.gaugeRows}
            onChangeText={(value) => updateValue('gaugeRows', value)}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.width')}
            value={values.gaugeWidth}
            onChangeText={(value) => updateValue('gaugeWidth', value)}
            suffix={unit}
          />
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.height')}
            value={values.gaugeHeight}
            onChangeText={(value) => updateValue('gaugeHeight', value)}
            suffix={unit}
          />
        </View>
      </FormCard>

      <FormCard title={t('tools.sizeCalculator.sections.targetSize')}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.width')}
            value={values.targetWidth}
            onChangeText={(value) => updateValue('targetWidth', value)}
            suffix={unit}
          />
          <CalculatorInput
            label={t('tools.sizeCalculator.fields.height')}
            value={values.targetHeight}
            onChangeText={(value) => updateValue('targetHeight', value)}
            suffix={unit}
          />
        </View>
      </FormCard>

      <View
        style={{
          padding: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderCurve: 'continuous',
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.md,
        }}>
        <Text
          selectable
          style={{
            fontSize: theme.size.xl,
            fontWeight: theme.weight.bold,
            color: theme.colors.textPrimary,
          }}>
          {t('tools.sizeCalculator.sections.estimate')}
        </Text>

        {result ? (
          <Animated.View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <ResultTile
              label={t('tools.sizeCalculator.fields.stitches').toLowerCase()}
              value={result.stitches}
            />
            <ResultTile
              label={t('tools.sizeCalculator.fields.rows').toLowerCase()}
              value={result.rows}
            />
          </Animated.View>
        ) : (
          <Text
            selectable
            style={{
              fontSize: theme.size.md,
              lineHeight: theme.size.md + 7,
              color: theme.colors.textSecondary,
            }}>
            {t('tools.sizeCalculator.emptyHelp')}
          </Text>
        )}

        <Text
          selectable
          style={{
            fontSize: theme.size.sm,
            lineHeight: theme.size.sm + 6,
            color: theme.colors.textTertiary,
          }}>
          {t('tools.sizeCalculator.disclaimer')}
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}
