import { theme } from "@/constants/Theme";
import {
  useOnboardingStore,
  type Goal,
  type Handedness,
  type SkillLevel,
} from "@/stores/onboardingStore";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type QuizField = "skillLevel" | "goal" | "handedness";

export type QuizOption = {
  id: NonNullable<SkillLevel> | NonNullable<Goal> | NonNullable<Handedness>;
  label: string;
  emoji: string;
};

export type QuizScreenConfig = {
  field: QuizField;
  title: string;
  subtitle: string;
  ctaLabel: string;
  options: QuizOption[];
};

type QuizValue = QuizOption["id"] | null;

function getStoredValue(
  field: QuizField,
  values: {
    skillLevel: SkillLevel;
    goal: Goal;
    handedness: Handedness;
  }
): QuizValue {
  switch (field) {
    case "skillLevel":
      return values.skillLevel;
    case "goal":
      return values.goal;
    case "handedness":
      return values.handedness;
  }
}

export default function QuizScreenView({
  steps,
  completeHref = "/(tabs)/(home)",
}: {
  steps: QuizScreenConfig[];
  completeHref?: Href;
}) {
  const insets = useSafeAreaInsets();
  const {
    skillLevel,
    goal,
    handedness,
    setSkillLevel,
    setGoal,
    setHandedness,
    setOnboardingCompleted,
  } = useOnboardingStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<QuizValue>(null);

  const currentStep = steps[stepIndex];
  const progress = (stepIndex + 1) / steps.length;

  useEffect(() => {
    setSelected(
      getStoredValue(currentStep.field, {
        skillLevel,
        goal,
        handedness,
      })
    );
  }, [currentStep.field, goal, handedness, skillLevel]);

  function persistAnswer(field: QuizField, value: QuizValue) {
    if (!value) return;

    switch (field) {
      case "skillLevel":
        setSkillLevel(value as NonNullable<SkillLevel>);
        break;
      case "goal":
        setGoal(value as NonNullable<Goal>);
        break;
      case "handedness":
        setHandedness(value as NonNullable<Handedness>);
        break;
    }
  }

  function handleSelect(value: QuizValue) {
    void Haptics.selectionAsync();
    setSelected(value);
  }

  function handleContinue() {
    if (!selected) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    persistAnswer(currentStep.field, selected);

    const isLastStep = stepIndex === steps.length - 1;
    if (isLastStep) {
      setOnboardingCompleted(true);
      router.replace(completeHref);
      return;
    }

    setStepIndex((value) => value + 1);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: insets.top + theme.spacing.xl,
        paddingBottom: insets.bottom + theme.spacing["3xl"],
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.xl,
        flexGrow: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text selectable style={styles.eyebrow}>
          Step {stepIndex + 1} of {steps.length}
        </Text>
        <Text selectable style={styles.title}>
          {currentStep.title}
        </Text>
        <Text selectable style={styles.subtitle}>
          {currentStep.subtitle}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentStep.options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
            >
              <View
                style={[
                  styles.emojiWrap,
                  isSelected && styles.emojiWrapSelected,
                ]}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>
              <Text
                selectable
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        disabled={!selected}
        onPress={handleContinue}
        style={[
          styles.ctaButton,
          !selected && styles.ctaButtonDisabled,
        ]}
      >
        <Text selectable style={styles.ctaLabel}>
          {currentStep.ctaLabel}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    borderCurve: "continuous",
    backgroundColor: theme.colors.muted,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  eyebrow: {
    fontSize: theme.size.sm,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontSize: theme.size["3xl"],
    lineHeight: 38,
    fontWeight: theme.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.size.lg,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.muted,
  },
  emojiWrapSelected: {
    backgroundColor: theme.colors.whiteSoft,
  },
  emoji: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    fontSize: theme.size.lg,
    lineHeight: 22,
    fontWeight: theme.weight.semibold,
    color: theme.colors.textPrimary,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
  },
  ctaButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
  },
  ctaButtonDisabled: {
    backgroundColor: theme.colors.textTertiary,
  },
  ctaLabel: {
    fontSize: theme.size.lg,
    fontWeight: theme.weight.semibold,
    color: theme.colors.white,
  },
});
