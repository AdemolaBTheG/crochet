import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  lineLimit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type CurrentProjectWidgetProps = {
  hasActiveProject: boolean;
  projectName: string;
  currentStep: number;
  totalSteps: number;
  counterLabel: string;
  counterValue: number;
};

const CurrentProjectWidget = (
  props: CurrentProjectWidgetProps,
  environment: WidgetEnvironment,
) => {
  'widget';

  const accentColor = '#2F6B5A';
  const widgetBackground = '#F7F4EE';
  const textPrimary = '#111111';
  const textSecondary = '#5F675F';
  const formatCounterLabel = (label: string, value: number) => {
    const normalized = label.trim().toLowerCase();
    if (!normalized) return '';

    return `${value} ${value === 1 ? normalized : `${normalized}s`}`;
  };

  if (!props.hasActiveProject) {
    if (environment.widgetFamily === 'accessoryInline') {
      return (
        <VStack
          spacing={0}
          modifiers={[containerBackground(widgetBackground, 'widget')]}>
          <Text>Open Crova to pick up a project</Text>
        </VStack>
      );
    }

    if (environment.widgetFamily === 'accessoryCircular') {
      return (
        <VStack
          spacing={0}
          modifiers={[containerBackground(widgetBackground, 'widget')]}>
          <Text>0</Text>
        </VStack>
      );
    }

    if (environment.widgetFamily === 'accessoryRectangular') {
      return (
        <VStack
          spacing={2}
          modifiers={[containerBackground(widgetBackground, 'widget')]}>
          <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accentColor)]}>
            CROVA
          </Text>
          <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>Start a project</Text>
        </VStack>
      );
    }

    return (
      <VStack
        spacing={10}
        modifiers={[padding({ all: 14 }), containerBackground(widgetBackground, 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accentColor)]}>
          CROVA
        </Text>
        <Text modifiers={[font({ size: 18, weight: 'bold', design: 'rounded' })]}>
          Pick up a project
        </Text>
        <Text
          modifiers={[
            font({ size: 13, weight: 'medium' }),
            foregroundStyle(textSecondary),
            lineLimit(2),
          ]}>
          Track rows, rounds, and progress from the Home Screen.
        </Text>
      </VStack>
    );
  }

  const progressText = `${props.currentStep}/${props.totalSteps}`;
  const stepCopy = `Step ${props.currentStep} of ${props.totalSteps}`;
  const counterCopy = formatCounterLabel(props.counterLabel, props.counterValue);

  if (environment.widgetFamily === 'accessoryInline') {
    return (
      <VStack
        spacing={0}
        modifiers={[containerBackground(widgetBackground, 'widget')]}>
        <Text>
          {props.projectName} {progressText}
        </Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <VStack
        spacing={0}
        modifiers={[containerBackground(widgetBackground, 'widget')]}>
        <Text modifiers={[font({ size: 14, weight: 'bold', design: 'rounded' })]}>
          {props.currentStep}
        </Text>
        <Text modifiers={[font({ size: 10 }), foregroundStyle(textSecondary)]}>
          /{props.totalSteps}
        </Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack
        spacing={3}
        modifiers={[containerBackground(widgetBackground, 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accentColor)]}>
          {progressText}
        </Text>
        <Text modifiers={[font({ size: 12, weight: 'medium' }), lineLimit(1)]}>
          {props.projectName}
        </Text>
        <Text
          modifiers={[
            font({ size: 11 }),
            foregroundStyle(textSecondary),
            lineLimit(1),
          ]}>
          {counterCopy || stepCopy}
        </Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'systemSmall') {
    return (
      <VStack
        spacing={10}
        modifiers={[padding({ all: 14 }), containerBackground(widgetBackground, 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accentColor)]}>
          CURRENT PROJECT
        </Text>
        <Text
          modifiers={[
            font({ size: 18, weight: 'bold', design: 'rounded' }),
            lineLimit(2),
          ]}>
          {props.projectName}
        </Text>
        <Text
          modifiers={[
            font({ size: 13, weight: 'semibold' }),
            foregroundStyle(textSecondary),
            lineLimit(1),
          ]}>
          {stepCopy}
        </Text>
        {counterCopy ? (
          <Text
            modifiers={[
              font({ size: 12, weight: 'medium' }),
              foregroundStyle(textSecondary),
              lineLimit(1),
            ]}>
            {counterCopy}
          </Text>
        ) : null}
      </VStack>
    );
  }

  return (
    <VStack
      spacing={12}
      modifiers={[padding({ all: 16 }), containerBackground(widgetBackground, 'widget')]}>
      <HStack spacing={8}>
        <Text modifiers={[font({ size: 12, weight: 'bold' }), foregroundStyle(accentColor)]}>
          CURRENT PROJECT
        </Text>
        <Text
          modifiers={[
            font({ size: 12, weight: 'bold' }),
            foregroundStyle(textSecondary),
          ]}>
          {progressText}
        </Text>
      </HStack>

      <Text
        modifiers={[
          font({ size: 20, weight: 'bold', design: 'rounded' }),
          foregroundStyle(textPrimary),
          lineLimit(2),
        ]}>
        {props.projectName}
      </Text>

      <HStack spacing={10}>
        <Text
          modifiers={[
            font({ size: 13, weight: 'semibold' }),
            foregroundStyle(textSecondary),
          ]}>
          {stepCopy}
        </Text>
        {counterCopy ? (
          <Text
            modifiers={[
              font({ size: 13, weight: 'medium' }),
              foregroundStyle(accentColor),
            ]}>
            {counterCopy}
          </Text>
        ) : null}
      </HStack>

      <VStack
        spacing={0}
        modifiers={[padding({ vertical: 8, horizontal: 10 }), foregroundStyle(textPrimary)]}>
        <Text
          modifiers={[
            font({ size: 12, weight: 'medium' }),
            foregroundStyle(textSecondary),
          ]}>
          Resume where you left off
        </Text>
      </VStack>
    </VStack>
  );
};

export default createWidget('CurrentProjectWidget', CurrentProjectWidget);
