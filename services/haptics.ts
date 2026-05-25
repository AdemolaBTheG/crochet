import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

type HapticIntent = 'tap' | 'softAdvance' | 'confirm' | 'complete' | 'warn' | 'cta';
type PulsarModule = typeof import('react-native-pulsar');

const PRELOADED_PRESETS = ['Wisp', 'Murmur', 'Bloom', 'Fanfare', 'Wobble', 'Strike'] as const;

let pulsarModule: PulsarModule | null | undefined;
let isInitialized = false;
let isEnabled = true;
let shouldUsePulsar = false;

function loadPulsarModule() {
  if (Platform.OS === 'web') return null;
  if (pulsarModule !== undefined) return pulsarModule;

  try {
    pulsarModule = require('react-native-pulsar') as PulsarModule;
  } catch {
    pulsarModule = null;
  }

  return pulsarModule;
}

function playFallback(intent: HapticIntent) {
  if (Platform.OS === 'web') return;

  switch (intent) {
    case 'tap':
      void ExpoHaptics.selectionAsync();
      break;
    case 'softAdvance':
      void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      break;
    case 'confirm':
      void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      break;
    case 'complete':
      void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
      break;
    case 'warn':
      void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
      break;
    case 'cta':
      void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
      break;
  }
}

function playPulsar(intent: HapticIntent, module: PulsarModule) {
  switch (intent) {
    case 'tap':
      module.Presets.wisp();
      break;
    case 'softAdvance':
      module.Presets.murmur();
      break;
    case 'confirm':
      module.Presets.bloom();
      break;
    case 'complete':
      module.Presets.fanfare();
      break;
    case 'warn':
      module.Presets.wobble();
      break;
    case 'cta':
      module.Presets.strike();
      break;
  }
}

function play(intent: HapticIntent) {
  if (!isInitialized) {
    initializeHaptics();
  }

  if (!isEnabled || Platform.OS === 'web') return;

  const module = loadPulsarModule();
  if (module && shouldUsePulsar) {
    try {
      playPulsar(intent, module);
      return;
    } catch {
      playFallback(intent);
      return;
    }
  }

  playFallback(intent);
}

export function initializeHaptics() {
  if (isInitialized) return;

  isInitialized = true;
  const module = loadPulsarModule();
  if (!module) return;

  try {
    module.Settings.enableHaptics(isEnabled);
    module.Settings.enableSound(false);
    module.Settings.enableCache(true);
    module.Settings.preloadPresets([...PRELOADED_PRESETS]);
    shouldUsePulsar =
      module.Settings.getHapticsSupportLevel() > module.HapticSupport.NO_SUPPORT;
  } catch {
    shouldUsePulsar = false;
  }
}

export function setHapticsEnabled(state: boolean) {
  isEnabled = state;
  const module = loadPulsarModule();

  if (!module) return;

  try {
    module.Settings.enableHaptics(state);
  } catch {
    // Ignore engine-level failures and keep the app functional.
  }
}

export function tap() {
  play('tap');
}

export function softAdvance() {
  play('softAdvance');
}

export function confirm() {
  play('confirm');
}

export function complete() {
  play('complete');
}

export function warn() {
  play('warn');
}

export function cta() {
  play('cta');
}
