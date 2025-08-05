-- Simple fix for the user creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)), 
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'role' = 'lead' THEN 'lead'::public.app_role
      WHEN NEW.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'::public.app_role
      ELSE 'analyst'::public.app_role
    END
  );
  RETURN NEW;
END;
$$;