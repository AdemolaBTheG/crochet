import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

export type ProjectActivityProps = {
  projectName: string;
  currentStep: number;
  totalSteps: number;
  counterLabel: string;
  counterValue: number;
};

const ProjectActivity = () => {
  'widget';
  return {
    compactLeading: (
      <Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#FFFFFF')]}>P</Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ weight: 'semibold' }), foregroundStyle('#FFFFFF')]}>1/5</Text>
    ),
    minimal: (
      <Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#FFFFFF')]}>P</Text>
    ),
    banner: (
      <VStack spacing={6} modifiers={[padding({ all: 16 })]}>
        <Text modifiers={[font({ size: 14, weight: 'bold' }), foregroundStyle('#FFFFFF')]}>
          Test Project
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle('#FFFFFF')]}>
          Step 1 of 5
        </Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('ProjectActivity', ProjectActivity);
