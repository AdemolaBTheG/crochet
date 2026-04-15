import { PressableScale } from '@/components/pressable-scale';
import { theme } from '@/constants/Theme';
import { usePremiumGate } from '@/hooks/usePremiumGate';
import { identifyStitch, type IdentifyStitchResult } from '@/services/ai';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectedImage = {
  uri: string;
  width?: number;
  height?: number;
};

const CONFIDENCE_SCORE: Record<'low' | 'medium' | 'high', number> = {
  low: 0.34,
  medium: 0.64,
  high: 0.92,
};

function getConfidenceLabel(
  confidence: 'low' | 'medium' | 'high',
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  return t(`tools.identifyStitch.analysis.confidence.${confidence}`);
}

function getConfidenceVisual(confidence: 'low' | 'medium' | 'high') {
  if (confidence === 'high') {
    return {
      badgeBackground: theme.colors.primary,
      badgeColor: theme.colors.white,
      barBackground: theme.colors.primarySoft,
      barFill: theme.colors.primary,
      borderColor: theme.colors.primaryBorder,
    };
  }

  if (confidence === 'medium') {
    return {
      badgeBackground: theme.colors.primarySoft,
      badgeColor: theme.colors.primary,
      barBackground: theme.colors.muted,
      barFill: theme.colors.primary,
      borderColor: theme.colors.primaryBorder,
    };
  }

  return {
    badgeBackground: theme.colors.muted,
    badgeColor: theme.colors.textSecondary,
    barBackground: theme.colors.muted,
    barFill: theme.colors.textTertiary,
    borderColor: theme.colors.border,
  };
}

async function ensureCameraPermission() {
  const currentPermission = await ImagePicker.getCameraPermissionsAsync();
  if (currentPermission.granted) return true;

  const nextPermission = await ImagePicker.requestCameraPermissionsAsync();
  return nextPermission.granted;
}

async function ensureLibraryPermission() {
  const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (currentPermission.granted) return true;

  const nextPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return nextPermission.granted;
}

function ActionButton({
  title,
  icon,
  onPress,
  variant,
}: {
  title: string;
  icon: React.ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{
        flex: 1,
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.pill,
        backgroundColor: isPrimary ? theme.colors.primary : theme.colors.primarySoft,
      }}>
      <SymbolView
        name={icon}
        size={18}
        weight="semibold"
        tintColor={isPrimary ? theme.colors.white : theme.colors.primary}
        fallback={<View style={{ width: 18, height: 18 }} />}
      />
      <Text
        style={{
          fontSize: theme.size.md,
          fontWeight: theme.weight.semibold,
          color: isPrimary ? theme.colors.white : theme.colors.primary,
        }}>
        {title}
      </Text>
    </PressableScale>
  );
}

function EmptyPreview() {
  const { t } = useTranslation();

  return (
    <View
      style={{
        minHeight: 260,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.md,
      }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
        }}>
        <SymbolView
          name="camera.viewfinder"
          size={30}
          weight="semibold"
          tintColor={theme.colors.primary}
          fallback={<View style={{ width: 30, height: 30 }} />}
        />
      </View>
      <Text
        selectable
        style={{
          fontSize: theme.size.lg,
          fontWeight: theme.weight.semibold,
          color: theme.colors.textPrimary,
          textAlign: 'center',
        }}>
        {t('tools.identifyStitch.empty.title')}
      </Text>
      <Text
        selectable
        style={{
          fontSize: theme.size.md,
          lineHeight: theme.size.md + 7,
          color: theme.colors.textSecondary,
          textAlign: 'center',
        }}>
        {t('tools.identifyStitch.empty.subtitle')}
      </Text>
    </View>
  );
}

function ImagePreview({ image }: { image: SelectedImage }) {
  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
      }}>
      <Image
        source={{ uri: image.uri }}
        contentFit="cover"
        style={{
          width: '100%',
          aspectRatio: 4 / 5,
          backgroundColor: theme.colors.muted,
        }}
      />
    </View>
  );
}

function TextList({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {items.map((item) => (
        <View key={item} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Text selectable style={{ color: theme.colors.primary, fontWeight: theme.weight.bold }}>
            -
          </Text>
          <Text
            selectable
            style={{
              flex: 1,
              fontSize: theme.size.md,
              lineHeight: theme.size.md + 7,
              color: theme.colors.textSecondary,
            }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ResultCard({
  hasImage,
  isAnalyzing,
  result,
  errorText,
}: {
  hasImage: boolean;
  isAnalyzing: boolean;
  result: IdentifyStitchResult | null;
  errorText: string | null;
}) {
  const { t } = useTranslation();
  const likelyStitches = Array.isArray(result?.likelyStitches) ? result.likelyStitches : [];
  const sortedLikelyStitches = [...likelyStitches].sort(
    (a, b) => CONFIDENCE_SCORE[b.confidence] - CONFIDENCE_SCORE[a.confidence],
  );
  const topStitch = sortedLikelyStitches[0] ?? null;
  const otherStitches = topStitch ? sortedLikelyStitches.slice(1) : [];
  const hasLikelyStitches = likelyStitches.length > 0;
  const hasBeginnerExplanation = Boolean(result?.beginnerExplanation?.trim());
  const hasCaution = Boolean(result?.caution?.trim());

  return (
    <View
      style={{
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.surface,
        gap: theme.spacing.sm,
      }}>
      <Text
        selectable
        style={{
          fontSize: theme.size.xl,
          fontWeight: theme.weight.bold,
          color: theme.colors.textPrimary,
        }}>
        {t('tools.identifyStitch.analysis.title')}
      </Text>

      {isAnalyzing ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text
            selectable
            style={{
              fontSize: theme.size.md,
              lineHeight: theme.size.md + 7,
              color: theme.colors.textSecondary,
            }}>
            {t('tools.identifyStitch.analysis.loading')}
          </Text>
        </View>
      ) : null}

      {!isAnalyzing && errorText ? (
        <Text
          selectable
          style={{
            fontSize: theme.size.md,
            lineHeight: theme.size.md + 7,
            color: theme.colors.error,
          }}>
          {errorText}
        </Text>
      ) : null}

      {!isAnalyzing && !errorText && !result ? (
        <Text
          selectable
          style={{
            fontSize: theme.size.md,
            lineHeight: theme.size.md + 7,
            color: theme.colors.textSecondary,
          }}>
          {hasImage
            ? t('tools.identifyStitch.analysis.photoReady')
            : t('tools.identifyStitch.analysis.noPhoto')}
        </Text>
      ) : null}

      {!isAnalyzing && result ? (
        <>
          {hasLikelyStitches ? (
            <View style={{ gap: theme.spacing.xs }}>
              {topStitch ? (
                <View
                  style={{
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: theme.colors.primarySoft,
                    borderWidth: 1,
                    borderColor: getConfidenceVisual(topStitch.confidence).borderColor,
                    gap: theme.spacing.sm,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: theme.spacing.sm,
                    }}>
                    <View style={{ flex: 1, gap: theme.spacing.xs }}>
                      <Text
                        selectable
                        style={{
                          fontSize: theme.size.sm,
                          fontWeight: theme.weight.bold,
                          color: theme.colors.primary,
                          textTransform: 'uppercase',
                          letterSpacing: 0.6,
                        }}>
                        {t('tools.identifyStitch.analysis.bestMatch')}
                      </Text>
                      <Text
                        selectable
                        style={{
                          fontSize: theme.size.xl,
                          fontWeight: theme.weight.bold,
                          color: theme.colors.textPrimary,
                        }}>
                        {topStitch.name}
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.radius.pill,
                        backgroundColor: getConfidenceVisual(topStitch.confidence).badgeBackground,
                      }}>
                      <Text
                        selectable
                        style={{
                          fontSize: theme.size.tiny,
                          fontWeight: theme.weight.bold,
                          color: getConfidenceVisual(topStitch.confidence).badgeColor,
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}>
                        {getConfidenceLabel(topStitch.confidence, t)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      height: 7,
                      borderRadius: theme.radius.pill,
                      backgroundColor: getConfidenceVisual(topStitch.confidence).barBackground,
                      overflow: 'hidden',
                    }}>
                    <View
                      style={{
                        width: `${Math.round(CONFIDENCE_SCORE[topStitch.confidence] * 100)}%`,
                        height: '100%',
                        borderRadius: theme.radius.pill,
                        backgroundColor: getConfidenceVisual(topStitch.confidence).barFill,
                      }}
                    />
                  </View>

                  <Text
                    selectable
                    style={{
                      fontSize: theme.size.md,
                      lineHeight: theme.size.md + 7,
                      color: theme.colors.textSecondary,
                    }}>
                    {topStitch.why}
                  </Text>
                </View>
              ) : null}

              {otherStitches.map((stitch) => (
                <View
                  key={`${stitch.name}-${stitch.confidence}`}
                  style={{
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.lg,
                    borderCurve: 'continuous',
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: getConfidenceVisual(stitch.confidence).borderColor,
                    gap: theme.spacing.xs,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: theme.spacing.md,
                    }}>
                    <Text
                      selectable
                      style={{
                        flex: 1,
                        fontSize: theme.size.md,
                        fontWeight: theme.weight.semibold,
                        color: theme.colors.textPrimary,
                      }}>
                      {stitch.name}
                    </Text>
                    <Text
                      selectable
                      style={{
                        fontSize: theme.size.tiny,
                        fontWeight: theme.weight.semibold,
                        color: getConfidenceVisual(stitch.confidence).badgeColor,
                        textTransform: 'uppercase',
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.radius.pill,
                        overflow: 'hidden',
                        backgroundColor: getConfidenceVisual(stitch.confidence).badgeBackground,
                      }}>
                      {getConfidenceLabel(stitch.confidence, t)}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 5,
                      borderRadius: theme.radius.pill,
                      backgroundColor: getConfidenceVisual(stitch.confidence).barBackground,
                      overflow: 'hidden',
                    }}>
                    <View
                      style={{
                        width: `${Math.round(CONFIDENCE_SCORE[stitch.confidence] * 100)}%`,
                        height: '100%',
                        borderRadius: theme.radius.pill,
                        backgroundColor: getConfidenceVisual(stitch.confidence).barFill,
                      }}
                    />
                  </View>
                  <Text
                    selectable
                    numberOfLines={2}
                    style={{
                      fontSize: theme.size.md,
                      lineHeight: theme.size.md + 7,
                      color: theme.colors.textSecondary,
                    }}>
                    {stitch.why}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              <Text
                selectable
                style={{
                  fontSize: theme.size.md,
                  lineHeight: theme.size.md + 7,
                  color: theme.colors.textSecondary,
                }}>
                {t('tools.identifyStitch.analysis.noLikelyStitchDetected')}
              </Text>
              <View
                style={{
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  borderCurve: 'continuous',
                  backgroundColor: theme.colors.muted,
                }}>
                <Text
                  selectable
                  style={{
                    fontSize: theme.size.sm,
                    lineHeight: theme.size.sm + 7,
                    color: theme.colors.textSecondary,
                  }}>
                  {t('tools.identifyStitch.analysis.noLikelyStitchHint')}
                </Text>
              </View>
            </>
          )}

          {hasBeginnerExplanation ? (
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                lineHeight: theme.size.md + 7,
                color: theme.colors.textSecondary,
              }}>
              {result.beginnerExplanation}
            </Text>
          ) : null}

          <View style={{ gap: theme.spacing.xs }}>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              {t('tools.identifyStitch.analysis.visibleClues')}
            </Text>
            <TextList items={result.visibleClues} />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <Text
              selectable
              style={{
                fontSize: theme.size.md,
                fontWeight: theme.weight.semibold,
                color: theme.colors.textPrimary,
              }}>
              {t('tools.identifyStitch.analysis.nextSteps')}
            </Text>
            <TextList items={result.nextSteps} />
          </View>

          {hasCaution ? (
            <Text
              selectable
              style={{
                fontSize: theme.size.sm,
                lineHeight: theme.size.sm + 6,
                color: theme.colors.textTertiary,
              }}>
              {result.caution}
            </Text>
          ) : null}
        </>
      ) : null}

      {hasImage && !isAnalyzing ? (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primarySoft,
          }}>
          <Text
            selectable
            style={{
              fontSize: theme.size.sm,
              fontWeight: theme.weight.semibold,
              color: theme.colors.primary,
            }}>
            {result
              ? t('tools.identifyStitch.analysis.aiResult')
              : t('tools.identifyStitch.analysis.readyForAi')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function IdentifyStitchScreen() {
  const { t } = useTranslation();
  const isPro = usePremiumGate();
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<IdentifyStitchResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeImage(image: SelectedImage) {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const resizedImage = await manipulateAsync(image.uri, [{ resize: { width: 1024 } }], {
        base64: true,
        compress: 0.82,
        format: SaveFormat.JPEG,
      });

      if (!resizedImage.base64) {
        throw new Error('Missing image data');
      }

      const result = await identifyStitch({
        imageBase64: resizedImage.base64,
        mimeType: 'image/jpeg',
      });

      setAnalysisResult(result);
    } catch (error) {
      console.warn('Identify stitch request failed', error);
      setAnalysisError(
        error instanceof Error
          ? t('tools.identifyStitch.errors.couldNotAnalyzeWithReason', { reason: error.message })
          : t('tools.identifyStitch.errors.couldNotAnalyze'),
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function takePhoto() {
    void Haptics.selectionAsync();

    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        t('tools.identifyStitch.alerts.cameraPermissionTitle'),
        t('tools.identifyStitch.alerts.cameraPermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const image = {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
      setSelectedImage(image);
      void analyzeImage(image);
    }
  }

  async function choosePhoto() {
    void Haptics.selectionAsync();

    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('tools.identifyStitch.alerts.photoPermissionTitle'),
        t('tools.identifyStitch.alerts.photoPermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const image = {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
      setSelectedImage(image);
      void analyzeImage(image);
    }
  }

  if (!isPro) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{
          padding: theme.spacing.xl,
          paddingBottom: insets.bottom,
          gap: theme.spacing.lg,
        }}>
        {selectedImage ? <ImagePreview image={selectedImage} /> : <EmptyPreview />}

        <ResultCard
          hasImage={Boolean(selectedImage)}
          isAnalyzing={isAnalyzing}
          result={analysisResult}
          errorText={analysisError}
        />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.xl,
          backgroundColor: theme.colors.background,
        }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <ActionButton
            title={t('tools.identifyStitch.actions.takePhoto')}
            icon="camera.fill"
            onPress={takePhoto}
            variant="primary"
          />
          <ActionButton
            title={t('tools.identifyStitch.actions.choosePhoto')}
            icon="photo.on.rectangle"
            onPress={choosePhoto}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}
