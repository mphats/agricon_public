
// This file has been deprecated in favor of backend processing
// The transformers functionality has been moved to a Supabase Edge Function
// to avoid browser compatibility issues with WebGPU

console.warn('transformerModel.ts is deprecated. AI processing now handled by backend edge function.');

// Placeholder functions for backward compatibility
export const preloadModels = async (): Promise<void> => {
  console.log('Models are now processed on the backend - no client-side preloading needed');
  return Promise.resolve();
};

export const analyzeWithTransformers = async (
  cropType: string,
  symptoms: string,
  knowledgeBase: any[]
): Promise<{
  diagnosis: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
}> => {
  console.warn('analyzeWithTransformers is deprecated. Use backend edge function instead.');
  throw new Error('Client-side transformers deprecated. Use backend processing.');
};

export const calculateSimilarity = async (symptom1: string, symptom2: string): Promise<number> => {
  console.warn('calculateSimilarity is deprecated. Use backend processing instead.');
  return 0;
};

export const initializeEmbeddingModel = async () => {
  console.warn('initializeEmbeddingModel is deprecated. Use backend processing instead.');
  return null;
};

export const initializeTextClassifier = async () => {
  console.warn('initializeTextClassifier is deprecated. Use backend processing instead.');
  return null;
};
