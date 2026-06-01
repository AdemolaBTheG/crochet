import type { ProjectChatStep } from '@/components/project-chat';
import type { Pattern } from '@/db/schema';
import { isSupabaseConfigured, supabase } from '@/utils/supabase';

type FunctionName =
  | 'project-chat'
  | 'stitch-fixes'
  | 'identify-stitch'
  | 'pattern-converter'
  | 'pattern-import-file'
  | 'pattern-import-photo'
  | 'pattern-import-website'
  | 'pattern-import-youtube';

class AiFunctionError extends Error {
  constructor(
    message: string,
    public functionName: FunctionName,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'AiFunctionError';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status?: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function parseFunctionError(
  functionName: FunctionName,
  response: Response | undefined,
  fallbackMessage: string,
) {
  if (!response) {
    return new AiFunctionError(fallbackMessage, functionName);
  }

  const payload = await response
    .clone()
    .json()
    .catch(() => null);
  const errorPayload =
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object'
      ? (payload.error as { code?: unknown; message?: unknown })
      : null;

  return new AiFunctionError(
    typeof errorPayload?.message === 'string' ? errorPayload.message : fallbackMessage,
    functionName,
    response.status,
    typeof errorPayload?.code === 'string' ? errorPayload.code : undefined,
  );
}

async function invokeFunction<TResponse>(
  functionName: FunctionName,
  body: Record<string, unknown>,
) {
  if (!isSupabaseConfigured) {
    throw new AiFunctionError(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      functionName,
    );
  }

  let lastError: AiFunctionError | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error, response } = await supabase.functions.invoke<TResponse>(functionName, {
      body,
    });

    if (!error && data) {
      return data;
    }

    lastError = error
      ? await parseFunctionError(functionName, response, error.message)
      : new AiFunctionError(
          'The AI service returned an empty response.',
          functionName,
          response?.status,
        );

    if (!shouldRetry(lastError.status) || attempt === 2) {
      break;
    }

    await sleep(600 * (attempt + 1));
  }

  throw lastError ?? new AiFunctionError('The AI request failed.', functionName);
}

export type AiChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function askProjectChat({
  question,
  messages,
  pattern,
  currentStep,
  counterLabel,
  counterValue,
}: {
  question: string;
  messages: AiChatMessage[];
  pattern?: Pattern;
  currentStep?: ProjectChatStep | null;
  counterLabel?: string;
  counterValue?: number | null;
}) {
  return invokeFunction<{ reply: string }>('project-chat', {
    question,
    messages,
    pattern: pattern
      ? {
          title: pattern.title,
          difficulty: pattern.difficulty,
          category: pattern.category,
          materialsText: pattern.materialsText,
          skillsText: pattern.skillsText,
        }
      : undefined,
    currentStep,
    counterLabel,
    counterValue,
  });
}

export async function askStitchFixes({
  problem,
  messages,
  contextText,
}: {
  problem: string;
  messages: AiChatMessage[];
  contextText?: string;
}) {
  return invokeFunction<{ reply: string }>('stitch-fixes', {
    problem,
    craft: 'crochet',
    experienceLevel: 'beginner',
    projectType: contextText,
    messages,
  });
}

export type IdentifyStitchResult = {
  likelyStitches: {
    name: string;
    confidence: 'low' | 'medium' | 'high';
    why: string;
  }[];
  visibleClues: string[];
  beginnerExplanation: string;
  nextSteps: string[];
  caution: string;
};

export type ImportedPatternDraft = {
  title: string;
  description: string;
  craft: 'crochet' | 'knitting' | 'unknown';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
  category: string | null;
  estimatedMinutes: number | null;
  materials: string[];
  skills: string[];
  expectationText: string;
  steps: Array<{
    type: 'instruction' | 'row' | 'round' | 'repeat';
    title: string;
    instruction: string;
    counterLabel: 'row' | 'round' | 'repeat' | null;
    targetCount: number | null;
  }>;
  notes: string[];
  warnings: string[];
  source: {
    type: 'file' | 'photo' | 'website' | 'youtube';
    url: string | null;
    title: string | null;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeConfidence(value: unknown): 'low' | 'medium' | 'high' {
  if (value === 'low' || value === 'medium' || value === 'high') return value;
  return 'low';
}

function normalizeIdentifyStitchResult(value: unknown): IdentifyStitchResult {
  const payload = asRecord(value);
  const likelyStitches = Array.isArray(payload?.likelyStitches)
    ? payload.likelyStitches
        .map((item) => {
          const stitch = asRecord(item);
          const name = asString(stitch?.name);
          if (!name) return null;

          return {
            name,
            confidence: normalizeConfidence(stitch?.confidence),
            why: asString(stitch?.why) ?? '',
          };
        })
        .filter(
          (item): item is { name: string; confidence: 'low' | 'medium' | 'high'; why: string } =>
            Boolean(item),
        )
    : [];

  const beginnerExplanation =
    asString(payload?.beginnerExplanation) ??
    asString(payload?.summary) ??
    asString(payload?.message) ??
    asString(payload?.reason) ??
    asString(payload?.notStitchReason) ??
    '';

  return {
    likelyStitches,
    visibleClues: asStringArray(payload?.visibleClues),
    beginnerExplanation,
    nextSteps: asStringArray(payload?.nextSteps),
    caution: asString(payload?.caution) ?? '',
  };
}

export async function identifyStitch({
  imageBase64,
  mimeType,
  notes,
}: {
  imageBase64: string;
  mimeType: string;
  notes?: string;
}) {
  const result = await invokeFunction<unknown>('identify-stitch', {
    imageBase64,
    mimeType,
    notes,
  });

  return normalizeIdentifyStitchResult(result);
}

export async function importPatternFromFile({
  sourceText,
  dataUrl,
  base64,
  mimeType,
  fileName,
  sourceUrl,
  craft,
  notes,
}: {
  sourceText?: string;
  dataUrl?: string;
  base64?: string;
  mimeType?: string;
  fileName?: string;
  sourceUrl?: string;
  craft?: 'crochet' | 'knitting' | 'unknown';
  notes?: string;
}) {
  return invokeFunction<ImportedPatternDraft>('pattern-import-file', {
    sourceText,
    dataUrl,
    base64,
    mimeType,
    fileName,
    sourceUrl,
    craft,
    notes,
  });
}

export async function importPatternFromPhoto({
  imageDataUrl,
  imageBase64,
  mimeType,
  craft,
  notes,
}: {
  imageDataUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  craft?: 'crochet' | 'knitting' | 'unknown';
  notes?: string;
}) {
  return invokeFunction<ImportedPatternDraft>('pattern-import-photo', {
    imageDataUrl,
    imageBase64,
    mimeType,
    craft,
    notes,
  });
}

export async function importPatternFromWebsite({
  url,
  pageTitle,
  pageText,
  craft,
  notes,
}: {
  url: string;
  pageTitle?: string;
  pageText?: string;
  craft?: 'crochet' | 'knitting' | 'unknown';
  notes?: string;
}) {
  return invokeFunction<ImportedPatternDraft>('pattern-import-website', {
    url,
    pageTitle,
    pageText,
    craft,
    notes,
  });
}

export async function importPatternFromYoutube({
  url,
  videoTitle,
  transcriptText,
  craft,
  notes,
}: {
  url: string;
  videoTitle?: string;
  transcriptText?: string;
  craft?: 'crochet' | 'knitting' | 'unknown';
  notes?: string;
}) {
  return invokeFunction<ImportedPatternDraft>('pattern-import-youtube', {
    url,
    videoTitle,
    transcriptText,
    craft,
    notes,
  });
}
