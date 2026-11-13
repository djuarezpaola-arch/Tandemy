-- Account types
CREATE TYPE public.app_role AS ENUM ('student', 'pyme');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own account type" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Business fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN business_name text NOT NULL DEFAULT '',
  ADD COLUMN business_type text NOT NULL DEFAULT '',
  ADD COLUMN rfc text NOT NULL DEFAULT '',
  ADD COLUMN phone text NOT NULL DEFAULT '',
  ADD COLUMN bio text NOT NULL DEFAULT '';

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  company_name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  budget integer NOT NULL DEFAULT 0 CHECK (budget >= 0),
  duration_days integer NOT NULL DEFAULT 7 CHECK (duration_days > 0),
  degrees text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Applications
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, student_id)
);
GRANT SELECT, INSERT, DELETE ON public.applications TO authenticated;
GRANT UPDATE (status) ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '' CHECK (char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, reviewer_id)
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Helper checks (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.owns_project(_project uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project AND owner_id = _user)
$$;
CREATE OR REPLACE FUNCTION public.has_applied(_project uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.applications WHERE project_id = _project AND student_id = _user)
$$;
CREATE OR REPLACE FUNCTION public.project_is_open(_project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.projects WHERE id = _project AND status = 'open')
$$;
CREATE OR REPLACE FUNCTION public.shares_application(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a JOIN public.projects p ON p.id = a.project_id
    WHERE (a.student_id = _a AND p.owner_id = _b) OR (a.student_id = _b AND p.owner_id = _a)
  )
$$;
CREATE OR REPLACE FUNCTION public.can_review(_application uuid, _reviewer uuid, _reviewee uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a JOIN public.projects p ON p.id = a.project_id
    WHERE a.id = _application AND a.status IN ('accepted', 'completed')
      AND ((a.student_id = _reviewer AND p.owner_id = _reviewee) OR (p.owner_id = _reviewer AND a.student_id = _reviewee))
  )
$$;

-- Project policies
CREATE POLICY "Open projects are public" ON public.projects FOR SELECT TO anon, authenticated USING (status = 'open');
CREATE POLICY "Owners read their projects" ON public.projects FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Applicants read projects they applied to" ON public.projects FOR SELECT TO authenticated USING (public.has_applied(id, auth.uid()));
CREATE POLICY "PyMEs publish projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'pyme'));
CREATE POLICY "Owners update projects" ON public.projects FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete projects" ON public.projects FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Company name always comes from the owner's profile
CREATE OR REPLACE FUNCTION public.set_project_company()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    SELECT coalesce(nullif(business_name, ''), nullif(display_name, ''), 'PyME') INTO NEW.company_name FROM public.profiles WHERE id = NEW.owner_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_project_company BEFORE INSERT OR UPDATE OF owner_id, company_name ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_project_company();

-- Application policies
CREATE POLICY "Students and owners read applications" ON public.applications FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.owns_project(project_id, auth.uid()));
CREATE POLICY "Students apply to open projects" ON public.applications FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND status = 'pending' AND public.has_role(auth.uid(), 'student') AND public.project_is_open(project_id));
CREATE POLICY "Owners decide on applications" ON public.applications FOR UPDATE TO authenticated USING (public.owns_project(project_id, auth.uid())) WITH CHECK (public.owns_project(project_id, auth.uid()));
CREATE POLICY "Students withdraw pending applications" ON public.applications FOR DELETE TO authenticated USING (student_id = auth.uid() AND status = 'pending');

-- Review policies
CREATE POLICY "Parties read their reviews" ON public.reviews FOR SELECT TO authenticated USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());
CREATE POLICY "Parties review finished work" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid() AND public.can_review(application_id, auth.uid(), reviewee_id));

-- People working together can see each other's profile
CREATE POLICY "Collaborators read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.shares_application(id, auth.uid()));

-- Signup: profile + account type from signup choice (students by default)
CREATE OR REPLACE FUNCTION public.create_student_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.profiles (id, display_name, student_number, degree, semester, business_name, business_type, rfc, phone, avatar_url)
  VALUES (
    NEW.id,
    coalesce(nullif(meta->>'display_name', ''), nullif(meta->>'full_name', ''), nullif(meta->>'name', ''), ''),
    coalesce(meta->>'student_number', ''), coalesce(meta->>'degree', ''), coalesce(meta->>'semester', ''),
    coalesce(meta->>'business_name', ''), coalesce(meta->>'business_type', ''), coalesce(meta->>'rfc', ''), coalesce(meta->>'phone', ''),
    nullif(coalesce(meta->>'avatar_url', meta->>'picture'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN meta->>'account_type' = 'pyme' THEN 'pyme'::public.app_role ELSE 'student'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Existing accounts become students; fill names from social sign-in
INSERT INTO public.user_roles (user_id, role) SELECT id, 'student' FROM auth.users ON CONFLICT DO NOTHING;
UPDATE public.profiles p SET
  display_name = coalesce(nullif(p.display_name, ''), u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  avatar_url = coalesce(p.avatar_url, u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
FROM auth.users u WHERE u.id = p.id;

-- Example projects already shown on the site
INSERT INTO public.projects (title, company_name, category, description, budget, duration_days, degrees) VALUES
  ('Orden de costos para una cafetería', 'Café Aroma', 'Finanzas', 'Necesitamos calcular el costo real de cada bebida y definir precios.', 1500, 10, 'Contador Público · Lic. Administración Financiera'),
  ('Diseño de 10 publicaciones para redes', 'Boutique Luna', 'Marketing', 'Publicaciones para la temporada navideña.', 1200, 7, 'Lic. Administración de Empresas · Lic. Negocios Internacionales'),
  ('Manual de procesos para tienda de ropa', 'Moda Norte', 'Administración', 'Documentar procesos de venta, inventario y atención.', 2200, 12, 'Lic. Administración de Empresas'),
  ('Trámites y permisos municipales para taller', 'Taller Pérez', 'Gestión Pública', 'Guía de licencias y permisos para operar en regla.', 900, 5, 'Lic. Administración y Gestión Pública'),
  ('Tablero de ventas del último trimestre', 'Abarrotes Don Chuy', 'Inteligencia de Negocios', 'Un tablero para ver qué productos se venden más.', 2800, 14, 'Lic. Inteligencia de Negocios'),
  ('Plan de exportación a Texas', 'Artesanías Rarámuri', 'Negocios Internacionales', 'Evaluar requisitos y costos para exportar artesanías.', 3200, 20, 'Lic. Negocios Internacionales'),
  ('Declaraciones y orden fiscal (RESICO)', 'Café Aroma', 'Contabilidad', 'Ordenar facturas y preparar declaraciones mensuales.', 1800, 8, 'Contador Público');
