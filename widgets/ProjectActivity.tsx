import { Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

export type ProjectActivityProps = {
  projectName: string;
  currentStep: number;
  totalSteps: number;
  counterLabel: string;
  counterValue: number;
};

type LiveActivityEnv = {
  colorScheme: 'light' | 'dark';
};

const ProjectActivity = (
  props: ProjectActivityProps,
  environment: LiveActivityEnv,
) => {
  'widget';
  const isDark = environment.colorScheme === 'dark';
  const accentColor = isDark ? '#FFFFFF' : '#007AFF';
  const secondaryColor = isDark ? '#98989E' : '#8E8E93';
  const stepText = `Step ${props.currentStep} of ${props.totalSteps}`;

  return {
    banner: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'bold' }), foregroundStyle(accentColor)]}>
          {props.projectName}
        </Text>
        <Text modifiers={[foregroundStyle(secondaryColor)]}>{stepText}</Text>
        <Text modifiers={[foregroundStyle(secondaryColor)]}>
          {props.counterLabel}: {props.counterValue}
        </Text>
      </VStack>
    ),
    compactLeading: (
      <Image
        systemName="scissors"
        color={accentColor}
      />
    ),
    compactTrailing: (
      <Text modifiers={[font({ weight: 'semibold' })]}>
        {props.currentStep}/{props.totalSteps}
      </Text>
    ),
    minimal: (
      <Image
        systemName="scissors"
        color={accentColor}
      />
    ),
    expandedLeading: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Image
          systemName="scissors"
          color={accentColor}
        />
        <Text modifiers={[font({ size: 12 })]}>{stepText}</Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'bold', size: 20 })]}>
          {props.counterValue}
        </Text>
        <Text modifiers={[font({ size: 12 })]}>{props.counterLabel}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'semibold' })]}>{props.projectName}</Text>
        <Text modifiers={[foregroundStyle(secondaryColor)]}>{stepText}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('ProjectActivity', ProjectActivity);
