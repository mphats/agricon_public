
import { supabase } from '@/integrations/supabase/client';

export const createInitialAIModel = async () => {
  try {
    console.log('Creating initial AI model...');
    
    // Check if we already have models
    const { data: existingModels, error: checkError } = await supabase
      .from('ai_models')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing models:', checkError);
      return null;
    }

    // If we already have models, don't create another
    if (existingModels && existingModels.length > 0) {
      console.log('AI models already exist, skipping creation');
      return existingModels[0];
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return null;
    }

    // Create the initial AI model
    const { data: newModel, error: createError } = await supabase
      .from('ai_models')
      .insert({
        name: 'Plant Disease Diagnosis Model v1.0',
        version: '1.0.0',
        model_type: 'plant_diagnosis',
        status: 'deployed',
        created_by: user.id,
        accuracy_score: 0.85,
        deployment_date: new Date().toISOString(),
        training_completed_at: new Date().toISOString(),
        hyperparameters: {
          algorithm: 'knowledge_base_matching',
          confidence_threshold: 0.3,
          max_results: 5
        },
        metrics: {
          precision: 0.85,
          recall: 0.82,
          f1_score: 0.83,
          diseases_covered: 11,
          crops_supported: 6
        }
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating AI model:', createError);
      return null;
    }

    console.log('Initial AI model created successfully:', newModel);
    return newModel;
  } catch (error) {
    console.error('Error in createInitialAIModel:', error);
    return null;
  }
};
