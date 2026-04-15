import { ProjectChat } from '@/components/project-chat';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StitchFixesScreen() {
  const isPro = usePremiumGate();
  const insets = useSafeAreaInsets();

  if (!isPro) return null;

  return (
    <ProjectChat
      mode="stitch-fixes"
      bottomInset={insets.bottom}
      introText="Tell me what looks wrong in your crochet or knitting, and I’ll help you narrow down the likely cause."
      contextText={[
        'You are troubleshooting stitch problems for a beginner crafter.',
        'Ask for the stitch, project type, row or round, yarn/hook size, and what changed.',
        'Give practical fixes for curling edges, widening or shrinking rows, tight chains, gaps, missed stitches, uneven tension, and lost counts.',
      ].join('\n\n')}
      inputPlaceholder="Describe the stitch problem"
      fallbackResponseText="I can help troubleshoot that. For this MVP, this is the Stitch Fixes chat shell using the shared project chat UI. Next step is connecting it to the AI route."
    />
  );
}
