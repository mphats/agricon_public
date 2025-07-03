
-- Create enum for data types
CREATE TYPE public.training_data_status AS ENUM ('pending', 'processing', 'processed', 'failed');
CREATE TYPE public.training_file_type AS ENUM ('image', 'pdf', 'csv', 'json', 'zip');
CREATE TYPE public.model_status AS ENUM ('training', 'trained', 'deployed', 'archived');

-- Create table for training datasets
CREATE TABLE public.training_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  crop_type crop_type,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_files INTEGER DEFAULT 0,
  processed_files INTEGER DEFAULT 0,
  status training_data_status DEFAULT 'pending'
);

-- Create table for individual training files
CREATE TABLE public.training_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID REFERENCES public.training_datasets ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type training_file_type NOT NULL,
  file_size BIGINT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_date TIMESTAMP WITH TIME ZONE,
  status training_data_status DEFAULT 'pending',
  metadata JSONB,
  labels JSONB,
  extracted_features JSONB
);

-- Create table for AI models
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'plant_diagnosis',
  dataset_id UUID REFERENCES public.training_datasets,
  status model_status DEFAULT 'training',
  accuracy_score NUMERIC(5,4),
  training_started_at TIMESTAMP WITH TIME ZONE,
  training_completed_at TIMESTAMP WITH TIME ZONE,
  deployment_date TIMESTAMP WITH TIME ZONE,
  model_path TEXT,
  hyperparameters JSONB,
  metrics JSONB,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for training jobs
CREATE TABLE public.training_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID REFERENCES public.training_datasets NOT NULL,
  model_id UUID REFERENCES public.ai_models,
  status training_data_status DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  progress_percentage INTEGER DEFAULT 0,
  logs TEXT,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.training_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage training datasets" ON public.training_datasets
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage training files" ON public.training_files
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage AI models" ON public.ai_models
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage training jobs" ON public.training_jobs
  FOR ALL USING (public.is_admin(auth.uid()));

-- Create storage bucket for training data
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-data', 'training-data', false);

-- Create storage policies for training data
CREATE POLICY "Admins can upload training data" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'training-data' AND 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can view training data" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'training-data' AND 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete training data" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'training-data' AND 
    public.is_admin(auth.uid())
  );

-- Create function to update dataset statistics
CREATE OR REPLACE FUNCTION update_dataset_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total files count
  UPDATE public.training_datasets 
  SET total_files = (
    SELECT COUNT(*) FROM public.training_files 
    WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id)
  ),
  processed_files = (
    SELECT COUNT(*) FROM public.training_files 
    WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id) 
    AND status = 'processed'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.dataset_id, OLD.dataset_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for dataset statistics
CREATE TRIGGER update_dataset_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.training_files
  FOR EACH ROW EXECUTE FUNCTION update_dataset_stats();
