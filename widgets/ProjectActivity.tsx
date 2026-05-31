import { HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  lineLimit,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

export type ProjectActivityProps = {
  projectName: string;
  currentStep: number;
  totalSteps: number;
  counterLabel: string;
  counterValue: number;
};

const ProjectActivity = (
  props: ProjectActivityProps,
  environment: LiveActivityEnvironment,
) => {
  'widget';

  const accentColor = '#79A893';
  const softAccentColor = '#E7F1EB';
  const textColor = '#FFFFFF';
  const secondaryTextColor = '#CFE0D8';
  const progressText = `${props.currentStep}/${props.totalSteps}`;
  const stepCopy = `Step ${props.currentStep} of ${props.totalSteps}`;
  const normalizedCounterLabel = props.counterLabel
    ? props.counterLabel.toLowerCase()
    : '';
  const counterCopy = normalizedCounterLabel
    ? `${props.counterValue} ${
        props.counterValue === 1
          ? normalizedCounterLabel
          : `${normalizedCounterLabel}s`
      }`
    : `${props.counterValue}`;

  return {
    banner: (
      <VStack spacing={8} modifiers={[padding({ all: 14 })]}>
        <HStack spacing={8}>
          <Image systemName="scissors" color={accentColor} size={16} />
          <Text
            modifiers={[
              font({ size: 12, weight: 'bold' }),
              foregroundStyle(accentColor),
              lineLimit(1),
            ]}>
            IN PROGRESS
          </Text>
        </HStack>

        <Text
          modifiers={[
            font({ size: 18, weight: 'bold', design: 'rounded' }),
            foregroundStyle(textColor),
            lineLimit(1),
          ]}>
          {props.projectName}
        </Text>

        <HStack spacing={12}>
          <Text
            modifiers={[
              font({ size: 13, weight: 'semibold' }),
              monospacedDigit(),
              foregroundStyle(textColor),
            ]}>
            {stepCopy}
          </Text>
          <Text
            modifiers={[
              font({ size: 13, weight: 'medium' }),
              foregroundStyle(secondaryTextColor),
              lineLimit(1),
            ]}>
            {counterCopy}
          </Text>
        </HStack>
      </VStack>
    ),
    bannerSmall: (
      <VStack spacing={4} modifiers={[padding({ all: 12 })]}>
        <Image systemName="scissors" color={accentColor} size={14} />
        <Text
          modifiers={[
            font({ size: 16, weight: 'bold', design: 'rounded' }),
            monospacedDigit(),
            foregroundStyle(textColor),
          ]}>
          {progressText}
        </Text>
      </VStack>
    ),
    compactLeading: (
      <Image systemName="scissors" color={accentColor} size={16} />
    ),
    compactTrailing: (
      <Text
        modifiers={[
          font({ size: 12, weight: 'bold', design: 'rounded' }),
          monospacedDigit(),
          foregroundStyle(textColor),
        ]}>
        {progressText}
      </Text>
    ),
    minimal: <Image systemName="scissors" color={accentColor} size={16} />,
    expandedLeading: (
      <VStack spacing={6} modifiers={[padding({ all: 12 })]}>
        <Image systemName="scissors" color={accentColor} size={18} />
        <Text
          modifiers={[
            font({ size: 11, weight: 'bold' }),
            foregroundStyle(softAccentColor),
          ]}>
          CROVA
        </Text>
      </VStack>
    ),
    expandedCenter: (
      <VStack spacing={4}>
        <Text
          modifiers={[
            font({ size: 15, weight: 'bold', design: 'rounded' }),
            foregroundStyle(textColor),
            lineLimit(1),
          ]}>
          {props.projectName}
        </Text>
        <Text
          modifiers={[
            font({ size: 12, weight: 'medium' }),
            foregroundStyle(secondaryTextColor),
            lineLimit(1),
          ]}>
          {stepCopy}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack spacing={2} modifiers={[padding({ all: 12 })]}>
        <Text
          modifiers={[
            font({ size: 22, weight: 'bold', design: 'rounded' }),
            monospacedDigit(),
            foregroundStyle(textColor),
          ]}>
          {progressText}
        </Text>
        <Text
          modifiers={[
            font({ size: 11, weight: 'medium' }),
            foregroundStyle(secondaryTextColor),
          ]}>
          progress
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <HStack spacing={8} modifiers={[padding({ horizontal: 12, bottom: 12 })]}>
        <Text
          modifiers={[
            font({ size: 12, weight: 'semibold' }),
            foregroundStyle(accentColor),
          ]}>
          Tracking
        </Text>
        <Text
          modifiers={[
            font({ size: 12, weight: 'medium' }),
            foregroundStyle(secondaryTextColor),
            lineLimit(1),
          ]}>
          {counterCopy} active
        </Text>
      </HStack>
    ),
  };
};

export default createLiveActivity('ProjectActivity', ProjectActivity);
