-- Create USERS table
CREATE TABLE IF NOT EXISTS public.users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  google_id VARCHAR(255) UNIQUE
);

-- Create LESSONS table
CREATE TABLE IF NOT EXISTS public.lessons (
  lesson_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PRACTICE_PROBLEMS table
CREATE TABLE IF NOT EXISTS public.practice_problems (
  practice_id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  choices JSONB,
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  topic VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create USER_LESSON_PROGRESS table
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  progress_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES public.lessons(lesson_id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create PRACTICE_ATTEMPTS table
CREATE TABLE IF NOT EXISTS public.practice_attempts (
  attempt_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
  practice_id INTEGER REFERENCES public.practice_problems(practice_id) ON DELETE CASCADE,
  user_answer VARCHAR(255),
  is_correct BOOLEAN,
  time_taken INTEGER, -- in seconds
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_problems_lesson ON public.practice_problems(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user ON public.practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_practice_problems_updated_at BEFORE UPDATE ON public.practice_problems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Seed data for lessons (required for static file setup)
INSERT INTO public.lessons (lesson_id, title, created_at) 
VALUES 
  (1, 'Linear Equations', NOW()),
  (2, 'Linear Inequalities', NOW()),
  (3, 'Non-Linear Systems', NOW()),
  (4, 'Calculus Applications', NOW())
ON CONFLICT (lesson_id) DO NOTHING;
