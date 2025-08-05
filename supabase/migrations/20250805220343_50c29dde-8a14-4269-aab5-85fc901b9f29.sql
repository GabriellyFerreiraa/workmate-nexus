-- Fix the user creation trigger function to handle enum types properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Safely handle the role conversion
  BEGIN
    user_role := COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'analyst');
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'analyst'; -- Default to analyst if invalid role
  END;

  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)), 
    user_role
  );
  RETURN NEW;
END;
$$;