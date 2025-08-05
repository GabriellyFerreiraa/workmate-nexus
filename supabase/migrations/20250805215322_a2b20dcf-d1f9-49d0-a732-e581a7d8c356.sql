-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'lead', 'analyst');

-- Create enum for work modes
CREATE TYPE public.work_mode AS ENUM ('office', 'home');

-- Create enum for absence request status
CREATE TYPE public.absence_status AS ENUM ('pending', 'approved', 'rejected', 'cancel_requested', 'cancelled');

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  area TEXT,
  role app_role NOT NULL DEFAULT 'analyst',
  start_time TIME NOT NULL DEFAULT '09:00:00',
  end_time TIME NOT NULL DEFAULT '18:00:00',
  lunch_start TIME DEFAULT '12:00:00',
  lunch_end TIME DEFAULT '13:00:00',
  work_days JSONB NOT NULL DEFAULT '{"mon": {"active": true, "mode": "office"}, "tue": {"active": true, "mode": "office"}, "wed": {"active": true, "mode": "office"}, "thu": {"active": true, "mode": "office"}, "fri": {"active": true, "mode": "office"}, "sat": {"active": false, "mode": "office"}, "sun": {"active": false, "mode": "office"}}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create absence requests table
CREATE TABLE public.absence_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analyst_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status absence_status NOT NULL DEFAULT 'pending',
  lead_comment TEXT,
  approved_by UUID REFERENCES public.profiles(user_id),
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status task_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Leads can update analyst profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin') OR 
  auth.uid() = user_id
);

CREATE POLICY "Leads can insert profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin') OR 
  auth.uid() = user_id
);

-- RLS Policies for absence requests
CREATE POLICY "Users can view their own absence requests" 
ON public.absence_requests 
FOR SELECT 
TO authenticated
USING (
  analyst_id = auth.uid() OR 
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Analysts can create their own absence requests" 
ON public.absence_requests 
FOR INSERT 
TO authenticated
WITH CHECK (analyst_id = auth.uid());

CREATE POLICY "Analysts can update their own pending requests" 
ON public.absence_requests 
FOR UPDATE 
TO authenticated
USING (
  analyst_id = auth.uid() AND status = 'pending'
);

CREATE POLICY "Leads can update absence requests" 
ON public.absence_requests 
FOR UPDATE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks assigned to them or created by them" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (
  assigned_to = auth.uid() OR 
  assigned_by = auth.uid() OR 
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Leads can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Assigned users can update task status" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (
  assigned_to = auth.uid() OR 
  assigned_by = auth.uid() OR 
  public.has_role(auth.uid(), 'lead') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_absence_requests_updated_at
  BEFORE UPDATE ON public.absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email), 
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'analyst')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();