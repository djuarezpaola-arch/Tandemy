CREATE OR REPLACE FUNCTION public.protect_application_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.project_id <> OLD.project_id OR NEW.student_id <> OLD.student_id OR NEW.message <> OLD.message OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Only the application status can change';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_application_fields BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.protect_application_fields();