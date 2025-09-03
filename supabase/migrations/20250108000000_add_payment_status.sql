-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'inactive',
    plan TEXT DEFAULT 'solo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add payment_status column to profiles table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payment_status') THEN
        ALTER TABLE public.profiles ADD COLUMN payment_status TEXT DEFAULT 'inactive';
    END IF;
END $$;

-- Update existing profiles to have payment_status based on current status
UPDATE public.profiles 
SET payment_status = CASE 
  WHEN status = 'active' THEN 'active'
  ELSE 'inactive'
END
WHERE payment_status IS NULL;

-- Add index for payment_status for better query performance (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_payment_status') THEN
        CREATE INDEX idx_profiles_payment_status ON public.profiles(payment_status);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id); 