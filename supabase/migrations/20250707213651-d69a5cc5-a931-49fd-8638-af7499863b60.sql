
-- Add phone_number column to market_listings table
ALTER TABLE public.market_listings 
ADD COLUMN phone_number TEXT;

-- Add is_featured column to market_listings table  
ALTER TABLE public.market_listings 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Create RLS policy for admins to manage featured products
CREATE POLICY "Admins can manage featured products" 
ON public.market_listings 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Update the existing policy to allow admins to view all listings
DROP POLICY IF EXISTS "Active listings are publicly viewable" ON public.market_listings;
CREATE POLICY "Active listings are publicly viewable" 
ON public.market_listings 
FOR SELECT 
USING (status = 'active'::market_listing_status OR is_admin(auth.uid()));
