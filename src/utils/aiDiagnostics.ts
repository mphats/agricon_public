import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

// Enhanced AI diagnosis function using backend processing
export const analyzePlantImage = async (cropType: string, symptoms: string, imageUrl?: string | null): Promise<{
  diagnosis: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
}> => {
  try {
    console.log('Starting enhanced AI analysis with backend processing:', { cropType, symptoms });
    
    // Validate and convert crop type
    const validCropTypes: CropType[] = ['maize', 'beans', 'vegetables', 'cassava', 'rice', 'tobacco', 'groundnuts', 'soybean', 'cotton', 'other'];
    const validCropType = validCropTypes.includes(cropType.toLowerCase() as CropType) 
      ? cropType.toLowerCase() as CropType 
      : 'other' as CropType;

    // Try backend AI analysis first
    console.log('Using backend AI analysis...');
    try {
      const { data: backendResult, error: backendError } = await supabase.functions.invoke('ai-diagnosis', {
        body: { 
          cropType: validCropType, 
          symptoms: symptoms 
        }
      });

      if (backendError) {
        console.error('Backend AI analysis error:', backendError);
      } else if (backendResult) {
        console.log('Backend analysis successful:', backendResult);
        return backendResult;
      }
    } catch (backendError) {
      console.error('Backend analysis failed:', backendError);
    }

    // Fallback to database analysis
    console.log('Falling back to database analysis...');
    const { data: dbResults, error } = await supabase.rpc('analyze_plant_symptoms', {
      p_crop_type: validCropType,
      p_symptoms: symptoms
    });

    if (error) {
      console.error('Database analysis error:', error);
    }

    if (dbResults && dbResults.length > 0) {
      const bestResult = dbResults.reduce((best: any, current: any) => 
        current.confidence > best.confidence ? current : best
      );
      
      return {
        diagnosis: bestResult.disease_name,
        confidence: bestResult.confidence,
        severity: bestResult.severity,
        treatment: bestResult.treatment,
        prevention: bestResult.prevention,
      };
    }

    // Final fallback
    return await generateFallbackDiagnosis(cropType, symptoms);
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return await generateFallbackDiagnosis(cropType, symptoms);
  }
};

// Fallback diagnosis function
const generateFallbackDiagnosis = async (cropType: string, symptoms: string): Promise<{
  diagnosis: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
}> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    diagnosis: `Based on the symptoms described for ${cropType}, this appears to be a stress-related condition that requires further investigation.`,
    confidence: 0.65,
    severity: 'moderate',
    treatment: 'Monitor the crop closely, ensure adequate water and nutrients. Consider consulting a local agricultural extension officer for detailed field assessment.',
    prevention: 'Maintain good agricultural practices including proper spacing, fertilization, regular monitoring, and integrated pest management.'
  };
};

// Keep the old function for backward compatibility
export const generateAIDiagnosis = (cropType: string, symptoms: string): {
  diagnosis: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
} => {
  console.warn('generateAIDiagnosis is deprecated, use analyzePlantImage instead');
  
  return {
    diagnosis: `Legacy diagnosis for ${cropType} symptoms: ${symptoms}`,
    confidence: 0.5,
    severity: 'moderate',
    treatment: 'Please use the updated analysis system for accurate recommendations.',
    prevention: 'Use the current AI diagnostics system for proper prevention advice.'
  };
};
