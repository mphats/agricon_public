
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text similarity function using cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

// Simple text vectorization using character frequency
function vectorizeText(text: string): number[] {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const vector = new Array(26).fill(0);
  const normalizedText = text.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const char of normalizedText) {
    const index = chars.indexOf(char);
    if (index !== -1) {
      vector[index]++;
    }
  }
  
  // Normalize the vector
  const sum = vector.reduce((a, b) => a + b, 0);
  return sum > 0 ? vector.map(v => v / sum) : vector;
}

// Enhanced text similarity using multiple methods
function calculateTextSimilarity(text1: string, text2: string): number {
  // Method 1: Character frequency similarity
  const vec1 = vectorizeText(text1);
  const vec2 = vectorizeText(text2);
  const charSimilarity = cosineSimilarity(vec1, vec2);
  
  // Method 2: Keyword matching
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  const keywordSimilarity = commonWords.length / Math.max(words1.length, words2.length);
  
  // Method 3: N-gram similarity (bigrams)
  const bigrams1 = [];
  const bigrams2 = [];
  
  for (let i = 0; i < text1.length - 1; i++) {
    bigrams1.push(text1.substring(i, i + 2));
  }
  for (let i = 0; i < text2.length - 1; i++) {
    bigrams2.push(text2.substring(i, i + 2));
  }
  
  const commonBigrams = bigrams1.filter(bg => bigrams2.includes(bg));
  const bigramSimilarity = commonBigrams.length / Math.max(bigrams1.length, bigrams2.length);
  
  // Weighted combination
  return (charSimilarity * 0.3) + (keywordSimilarity * 0.5) + (bigramSimilarity * 0.2);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { cropType, symptoms } = await req.json();

    console.log('Processing AI diagnosis request:', { cropType, symptoms });

    // Get knowledge base for the crop type
    const { data: knowledgeBase, error: kbError } = await supabaseClient
      .from('plant_disease_knowledge')
      .select('*')
      .eq('crop_type', cropType);

    if (kbError) {
      console.error('Knowledge base error:', kbError);
      throw new Error('Failed to fetch knowledge base');
    }

    if (!knowledgeBase || knowledgeBase.length === 0) {
      return new Response(JSON.stringify({
        diagnosis: `No specific knowledge available for ${cropType}. Please consult with a local agricultural expert.`,
        confidence: 0.3,
        severity: 'moderate',
        treatment: 'Monitor the crop closely and document symptom progression.',
        prevention: 'Implement good agricultural practices and regular monitoring.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let bestMatch = {
      disease: null as any,
      confidence: 0,
      similarity: 0
    };

    // Enhanced symptom matching
    for (const disease of knowledgeBase) {
      const diseaseSymptoms = disease.symptoms.join(' ');
      
      // Calculate semantic similarity
      const similarity = calculateTextSimilarity(symptoms.toLowerCase(), diseaseSymptoms.toLowerCase());
      
      // Enhanced confidence calculation
      let confidence = similarity;
      
      // Boost confidence for exact keyword matches
      const keywordMatches = disease.symptoms.filter((symptom: string) =>
        symptoms.toLowerCase().includes(symptom.toLowerCase())
      ).length;
      
      if (keywordMatches > 0) {
        confidence += (keywordMatches / disease.symptoms.length) * 0.4;
      }
      
      // Check for critical symptom indicators
      const criticalTerms = ['dying', 'dead', 'severe', 'widespread', 'wilting badly'];
      const hasCriticalTerms = criticalTerms.some(term => 
        symptoms.toLowerCase().includes(term)
      );
      
      if (hasCriticalTerms) {
        confidence += 0.1;
      }
      
      confidence = Math.min(confidence, 1.0);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          disease,
          confidence,
          similarity
        };
      }
    }

    // Determine severity based on confidence and keywords
    let severity = 'mild';
    const symptomsLower = symptoms.toLowerCase();
    
    if (bestMatch.confidence > 0.8 || symptomsLower.includes('severe') || symptomsLower.includes('dying')) {
      severity = 'severe';
    } else if (bestMatch.confidence > 0.6 || symptomsLower.includes('spreading') || symptomsLower.includes('wilting')) {
      severity = 'moderate';
    }

    if (bestMatch.disease && bestMatch.confidence > 0.4) {
      return new Response(JSON.stringify({
        diagnosis: `${bestMatch.disease.disease_name} - Backend AI analysis suggests this condition based on advanced symptom pattern matching (similarity: ${Math.round(bestMatch.similarity * 100)}%).`,
        confidence: bestMatch.confidence,
        severity,
        treatment: bestMatch.disease.treatment,
        prevention: bestMatch.disease.prevention || 'Regular monitoring and good agricultural practices recommended.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fallback response
    return new Response(JSON.stringify({
      diagnosis: `Unidentified condition requiring expert consultation. Backend analysis detected some patterns but needs more specific symptom information for ${cropType}.`,
      confidence: Math.max(bestMatch.confidence, 0.3),
      severity: 'moderate',
      treatment: 'Recommend consulting with a local agricultural extension officer. Monitor plant closely and document symptom progression.',
      prevention: 'Implement integrated pest management, ensure proper nutrition, and maintain good field hygiene.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Backend AI diagnosis error:', error);
    return new Response(JSON.stringify({
      error: 'Analysis failed',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
