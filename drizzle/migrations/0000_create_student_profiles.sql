CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 student_number text NOT NULL DEFAULT '',
 degree text NOT NULL DEFAULT '',
 semester text NOT NULL DEFAULT '',
 avatar_url text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE FUNCTION public.create_student_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles (id, display_name, student_number, degree, semester)
 VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'display_name', ''), coalesce(NEW.raw_user_meta_data->>'student_number', ''), coalesce(NEW.raw_user_meta_data->>'degree', ''), coalesce(NEW.raw_user_meta_data->>'semester', ''));
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_student_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_student_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_student_profile();