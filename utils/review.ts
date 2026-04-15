import * as StoreReview from 'expo-store-review';
import { Alert } from 'react-native';
import zustandStorage from '@/stores/storage';

type ReviewSource = 'settings' | 'project-complete' | 'lesson-practice-complete';

type ReviewState = {
  lastPromptedAt?: number;
  promptedSources?: Partial<Record<ReviewSource, number>>;
};

const reviewStateKey = 'review-state-v1';
const automaticPromptCooldownMs = 1000 * 60 * 60 * 24 * 21;

async function readReviewState(): Promise<ReviewState> {
  const value = await zustandStorage.getItem(reviewStateKey);
  if (!value) return {};

  try {
    return JSON.parse(value) as ReviewState;
  } catch {
    return {};
  }
}

async function writeReviewState(state: ReviewState) {
  await zustandStorage.setItem(reviewStateKey, JSON.stringify(state));
}

async function canAskForReview(source: ReviewSource, force: boolean) {
  if (force) return true;

  const state = await readReviewState();
  const now = Date.now();

  if (state.promptedSources?.[source]) return false;
  if (state.lastPromptedAt && now - state.lastPromptedAt < automaticPromptCooldownMs) return false;

  return true;
}

async function markReviewPrompted(source: ReviewSource) {
  const state = await readReviewState();
  const now = Date.now();

  await writeReviewState({
    ...state,
    lastPromptedAt: now,
    promptedSources: {
      ...state.promptedSources,
      [source]: now,
    },
  });
}

async function requestNativeReview(source: ReviewSource) {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return false;

    await StoreReview.requestReview();
    await markReviewPrompted(source);
    return true;
  } catch {
    return false;
  }
}

export async function askForReview({
  source = 'settings',
  force = source === 'settings',
}: {
  source?: ReviewSource;
  force?: boolean;
} = {}): Promise<boolean> {
  const isEligible = await canAskForReview(source, force);
  if (!isEligible) return false;

  if (!force) {
    return requestNativeReview(source);
  }

  return new Promise<boolean>((resolve) => {
    Alert.alert(
      'Enjoying Crochet?',
      'Please take a moment to rate us on the App Store.',
      [
        {
          text: 'No, thanks',
          style: 'cancel',
          onPress: () => {
            resolve(false);
          },
        },
        {
          text: 'Rate Now',
          style: 'default',
          onPress: async () => {
            const didRequest = await requestNativeReview(source);
            resolve(didRequest);
          },
        },
      ],
    );
  });
}
