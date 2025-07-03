
-- Update the user's profile to grant admin privileges
UPDATE public.profiles 
SET is_admin = true, 
    updated_at = now()
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'mphatsos45@gmail.com'
);
