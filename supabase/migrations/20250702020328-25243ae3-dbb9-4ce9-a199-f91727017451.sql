
-- Create a table for storing plant disease knowledge base
CREATE TABLE public.plant_disease_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type crop_type NOT NULL,
  disease_name TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  causes TEXT,
  treatment TEXT NOT NULL,
  prevention TEXT,
  confidence_threshold NUMERIC DEFAULT 0.7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the knowledge base
ALTER TABLE public.plant_disease_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to knowledge base
CREATE POLICY "Knowledge base is publicly readable" 
  ON public.plant_disease_knowledge 
  FOR SELECT 
  USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage knowledge base" 
  ON public.plant_disease_knowledge 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Insert some sample knowledge base data
INSERT INTO public.plant_disease_knowledge (crop_type, disease_name, symptoms, causes, treatment, prevention) VALUES
('maize', 'Northern Corn Leaf Blight', ARRAY['gray-green lesions', 'elongated spots', 'yellow halos'], 'Exserohilum turcicum fungus', 'Apply fungicide containing propiconazole or azoxystrobin. Remove infected leaves.', 'Use resistant varieties, practice crop rotation, ensure proper spacing for air circulation.'),
('maize', 'Fall Armyworm', ARRAY['holes in leaves', 'chewed leaves', 'frass presence', 'damaged growing points'], 'Spodoptera frugiperda larvae', 'Use biological pesticides like Bt or chemical control with emamectin benzoate. Apply early morning or evening.', 'Regular field monitoring, pheromone traps, intercropping with desmodium.'),
('maize', 'Nitrogen Deficiency', ARRAY['yellowing leaves', 'stunted growth', 'pale green color'], 'Insufficient nitrogen in soil', 'Apply nitrogen fertilizer (urea 46%) at 50kg per hectare. Split application recommended.', 'Regular soil testing, balanced fertilization program, organic matter incorporation.'),
('beans', 'Bean Rust', ARRAY['orange pustules', 'yellow spots', 'leaf drop'], 'Uromyces appendiculatus fungus', 'Apply copper-based fungicides or systemic fungicides like tebuconazole.', 'Plant resistant varieties, ensure good air circulation, avoid overhead irrigation.'),
('beans', 'Root Rot', ARRAY['wilting', 'yellowing', 'stunted growth', 'dark roots'], 'Fusarium or Pythium species', 'Improve drainage, apply fungicide drench with metalaxyl. Consider replanting in raised beds.', 'Use certified seeds, improve soil drainage, practice crop rotation.'),
('vegetables', 'Bacterial Wilt', ARRAY['sudden wilting', 'yellowing leaves', 'brown stem interior'], 'Ralstonia solanacearum bacteria', 'Remove infected plants immediately. Apply copper-based bactericides preventively.', 'Use disease-free seeds, practice crop rotation, improve soil drainage.'),
('vegetables', 'Aphid Infestation', ARRAY['curled leaves', 'sticky honeydew', 'stunted growth'], 'Various aphid species', 'Apply insecticidal soap or neem oil. Use beneficial insects like ladybugs.', 'Regular monitoring, reflective mulches, companion planting with repellent herbs.'),
('cassava', 'Cassava Mosaic Disease', ARRAY['mosaic patterns', 'yellow patches', 'leaf distortion'], 'Cassava mosaic virus', 'Remove infected plants. Use virus-free planting material. No chemical cure available.', 'Use certified disease-free cuttings, control whitefly vectors, practice field sanitation.'),
('groundnuts', 'Leaf Spot', ARRAY['dark spots', 'yellow halos', 'premature defoliation'], 'Cercospora arachidicola', 'Apply fungicides like chlorothalonil or mancozeb at first sign of disease.', 'Use resistant varieties, practice crop rotation, ensure proper plant spacing.'),
('rice', 'Rice Blast', ARRAY['diamond-shaped lesions', 'gray centers', 'brown borders'], 'Magnaporthe oryzae fungus', 'Apply fungicides like tricyclazole or isoprothiolane. Adjust nitrogen application.', 'Use resistant varieties, balanced fertilization, proper water management.'),
('tobacco', 'Tobacco Mosaic Virus', ARRAY['mosaic patterns', 'mottled leaves', 'stunted growth'], 'Tobacco mosaic virus', 'Remove infected plants. No chemical cure. Focus on prevention.', 'Use virus-free seeds, practice field sanitation, control aphid vectors.');

-- Create a function to analyze plant symptoms using the knowledge base
CREATE OR REPLACE FUNCTION public.analyze_plant_symptoms(
  p_crop_type crop_type,
  p_symptoms TEXT
) RETURNS TABLE (
  disease_name TEXT,
  confidence NUMERIC,
  treatment TEXT,
  prevention TEXT,
  severity TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  symptom_keywords TEXT[];
  disease_record RECORD;
  match_count INTEGER;
  total_symptoms INTEGER;
  confidence_score NUMERIC;
BEGIN
  -- Convert symptoms to lowercase and split into keywords
  symptom_keywords := string_to_array(lower(p_symptoms), ' ');
  
  -- Query knowledge base for potential matches
  FOR disease_record IN 
    SELECT kd.disease_name, kd.symptoms, kd.treatment, kd.prevention
    FROM public.plant_disease_knowledge kd
    WHERE kd.crop_type = p_crop_type
  LOOP
    match_count := 0;
    total_symptoms := array_length(disease_record.symptoms, 1);
    
    -- Count symptom matches
    FOR i IN 1..array_length(disease_record.symptoms, 1) LOOP
      IF p_symptoms ILIKE '%' || disease_record.symptoms[i] || '%' THEN
        match_count := match_count + 1;
      END IF;
    END LOOP;
    
    -- Calculate confidence score
    IF total_symptoms > 0 THEN
      confidence_score := (match_count::NUMERIC / total_symptoms::NUMERIC);
      
      -- Only return results with reasonable confidence
      IF confidence_score >= 0.3 THEN
        disease_name := disease_record.disease_name;
        confidence := confidence_score;
        treatment := disease_record.treatment;
        prevention := disease_record.prevention;
        
        -- Determine severity based on confidence and disease type
        IF confidence_score >= 0.8 THEN
          severity := 'severe';
        ELSIF confidence_score >= 0.6 THEN
          severity := 'moderate';
        ELSE
          severity := 'mild';
        END IF;
        
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  -- If no matches found, return a generic response
  IF NOT FOUND THEN
    disease_name := 'Unknown condition - requires expert consultation';
    confidence := 0.5;
    treatment := 'Monitor the crop closely, ensure adequate water and nutrients. Consider consulting a local agricultural extension officer.';
    prevention := 'Maintain good agricultural practices including proper spacing, fertilization, and pest monitoring.';
    severity := 'moderate';
    RETURN NEXT;
  END IF;
END;
$$;
