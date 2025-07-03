
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface KaggleDatasetRequest {
  datasetName: string;
  trainDatasetName?: string;
  cropType?: string;
  description?: string;
}

serve(async (req) => {
  console.log('Edge function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Processing request...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header to validate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return new Response(JSON.stringify({
        error: 'Authorization required',
        message: 'Please provide a valid authorization token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(JSON.stringify({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Get Kaggle credentials from environment
    const kaggleUsername = Deno.env.get('KAGGLE_USERNAME');
    const kaggleKey = Deno.env.get('KAGGLE_KEY');

    if (!kaggleUsername || !kaggleKey) {
      console.log('Kaggle credentials not found');
      return new Response(JSON.stringify({
        error: 'Kaggle credentials not configured',
        message: 'Please set KAGGLE_USERNAME and KAGGLE_KEY environment variables'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await req.json();
    const { datasetName, trainDatasetName, cropType, description }: KaggleDatasetRequest = requestBody;
    
    console.log('Starting Kaggle dataset import:', { datasetName, trainDatasetName });

    // Create basic auth header for Kaggle API
    const kaggleAuth = btoa(`${kaggleUsername}:${kaggleKey}`);
    
    // First, get dataset metadata from Kaggle API
    console.log('Fetching dataset metadata from Kaggle...');
    const metadataResponse = await fetch(`https://www.kaggle.com/api/v1/datasets/view/${datasetName}`, {
      headers: {
        'Authorization': `Basic ${kaggleAuth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Kaggle API error:', errorText);
      return new Response(JSON.stringify({
        error: 'Failed to fetch dataset metadata',
        message: `Kaggle API returned: ${metadataResponse.status} ${errorText}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const metadata = await metadataResponse.json();
    console.log('Dataset metadata:', metadata);

    // Download the dataset
    console.log('Downloading dataset from Kaggle...');
    const downloadResponse = await fetch(`https://www.kaggle.com/api/v1/datasets/download/${datasetName}`, {
      headers: {
        'Authorization': `Basic ${kaggleAuth}`
      }
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error('Dataset download error:', errorText);
      return new Response(JSON.stringify({
        error: 'Failed to download dataset',
        message: `Download failed: ${downloadResponse.status} ${errorText}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the zip file as array buffer
    const zipData = await downloadResponse.arrayBuffer();
    console.log('Dataset downloaded, size:', zipData.byteLength, 'bytes');

    // Create training dataset record
    const datasetDisplayName = trainDatasetName || `Kaggle Dataset: ${datasetName}`;
    const { data: trainingDataset, error: datasetError } = await supabaseClient
      .from('training_datasets')
      .insert({
        name: datasetDisplayName,
        description: description || `Imported from Kaggle dataset: ${datasetName}. ${metadata.subtitle || ''}`,
        crop_type: cropType || 'other',
        status: 'processing',
        created_by: user.id
      })
      .select()
      .single();

    if (datasetError) {
      console.error('Error creating training dataset:', datasetError);
      return new Response(JSON.stringify({
        error: 'Failed to create training dataset',
        message: datasetError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Training dataset created:', trainingDataset);

    // Store the zip file in Supabase Storage
    const fileName = `kaggle-${datasetName.replace('/', '-')}-${Date.now()}.zip`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('training-data')
      .upload(`datasets/${trainingDataset.id}/${fileName}`, new Uint8Array(zipData), {
        contentType: 'application/zip'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({
        error: 'Failed to store dataset',
        message: uploadError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Dataset uploaded to storage:', uploadData);

    // Create training file record
    const { error: fileError } = await supabaseClient
      .from('training_files')
      .insert({
        dataset_id: trainingDataset.id,
        filename: fileName,
        file_path: uploadData.path,
        file_type: 'zip',
        file_size: zipData.byteLength,
        status: 'processed',
        metadata: {
          source: 'kaggle',
          dataset_name: datasetName,
          kaggle_metadata: metadata,
          import_date: new Date().toISOString()
        }
      });

    if (fileError) {
      console.error('Error creating training file record:', fileError);
      // Continue anyway, as the main import succeeded
    }

    // Update dataset status to processed
    await supabaseClient
      .from('training_datasets')
      .update({
        status: 'processed',
        total_files: 1,
        processed_files: 1
      })
      .eq('id', trainingDataset.id);

    // Create AI model for training
    const modelName = `Plant Disease Diagnosis Model v1.0 - ${datasetDisplayName}`;
    const { data: aiModel, error: modelError } = await supabaseClient
      .from('ai_models')
      .insert({
        name: modelName,
        version: '1.0.0',
        model_type: 'plant_diagnosis',
        dataset_id: trainingDataset.id,
        status: 'training',
        training_started_at: new Date().toISOString(),
        created_by: user.id,
        hyperparameters: {
          dataset_source: 'kaggle',
          dataset_name: datasetName,
          crop_type: cropType
        }
      })
      .select()
      .single();

    if (modelError) {
      console.error('Error creating AI model:', modelError);
      return new Response(JSON.stringify({
        error: 'Dataset imported but failed to create AI model',
        message: modelError.message,
        dataset_id: trainingDataset.id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create training job
    const { data: trainingJob, error: jobError } = await supabaseClient
      .from('training_jobs')
      .insert({
        dataset_id: trainingDataset.id,
        model_id: aiModel.id,
        status: 'processing',
        started_at: new Date().toISOString(),
        progress_percentage: 25,
        logs: `Dataset imported successfully from Kaggle: ${datasetName}\nDataset size: ${(zipData.byteLength / 1024 / 1024).toFixed(2)} MB\nStarting model training...`,
        created_by: user.id
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating training job:', jobError);
    }

    console.log('Kaggle dataset import completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Kaggle dataset imported and training started successfully',
      dataset: trainingDataset,
      model: aiModel,
      training_job: trainingJob,
      import_stats: {
        dataset_size_mb: (zipData.byteLength / 1024 / 1024).toFixed(2),
        files_imported: 1,
        kaggle_dataset: datasetName
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Kaggle dataset import error:', error);
    return new Response(JSON.stringify({
      error: 'Import failed',
      message: error.message || 'An unexpected error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
