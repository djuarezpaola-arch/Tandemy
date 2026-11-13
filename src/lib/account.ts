import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AccountType = 'student' | 'pyme';
export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type Application = Tables<'applications'>;
export type Review = Tables<'reviews'>;

export const DEGREES = ['Contador Público', 'Administración de Empresas', 'Administración Financiera', 'Administración y Gestión Pública', 'Negocios Internacionales', 'Inteligencia de Negocios'];
export const CATEGORIES = ['Finanzas', 'Contabilidad', 'Marketing', 'Administración', 'Gestión Pública', 'Inteligencia de Negocios', 'Negocios Internacionales'];

export const APPLICATION_STATUS: Record<string, string> = { pending: 'En revisión', accepted: 'Aceptada', rejected: 'No seleccionada', completed: 'Terminada' };
export const PROJECT_STATUS: Record<string, string> = { open: 'Abierto', in_progress: 'En curso', completed: 'Terminado', closed: 'Cerrado' };

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

/** Data saved with a new account; the signup trigger turns it into the profile and account type. */
export function signupData(type: AccountType, form: FormData) {
  if (type === 'pyme') return { account_type: 'pyme', display_name: field(form, 'display_name'), business_name: field(form, 'business_name'), business_type: field(form, 'business_type'), rfc: field(form, 'rfc').toUpperCase(), phone: field(form, 'phone') };
  return { account_type: 'student', display_name: field(form, 'display_name'), student_number: field(form, 'student_number'), degree: field(form, 'degree'), semester: field(form, 'semester') };
}

/** Turns sign-in errors into clear Spanish messages. */
export function authErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string } | null;
  const code = err?.code ?? '';
  const message = err?.message ?? '';
  if (code === 'weak_password' || /weak|pwned/i.test(message)) return 'Esa contraseña es muy común o apareció en filtraciones de datos. Elige otra más segura (mínimo 8 caracteres, mezcla letras, números y símbolos).';
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) return 'Aún no confirmas tu correo. Abre el enlace que te enviamos y vuelve a iniciar sesión.';
  if (code === 'user_already_exists' || /already registered/i.test(message)) return 'Ya existe una cuenta con este correo. Inicia sesión.';
  if (/rate limit|too many/i.test(code + message)) return 'Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  if (/password should be at least/i.test(message)) return 'La contraseña debe tener al menos 8 caracteres.';
  if (/invalid.*email|email.*invalid/i.test(message)) return 'Revisa que tu correo esté bien escrito.';
  return 'No pudimos completar la solicitud. Inténtalo nuevamente.';
}

export function averageRating(reviews: Pick<Review, 'rating'>[]): number | null {
  if (!reviews.length) return null;
  return Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;
}

export const money = (n: number) => `$${n.toLocaleString('es-MX')}`;

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Inicia sesión para continuar.');
  return data.user;
}

export const accountQuery = () => queryOptions({
  queryKey: ['account'],
  queryFn: async () => {
    const user = await currentUserId();
    const [{ data: profile, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
    ]);
    if (pErr) throw pErr; if (rErr) throw rErr;
    const type: AccountType = roles?.some(r => r.role === 'pyme') ? 'pyme' : 'student';
    return { user: { id: user.id, email: user.email ?? '' }, profile, type };
  },
});

export const reviewsReceivedQuery = () => queryOptions({
  queryKey: ['reviews', 'received'],
  queryFn: async () => {
    const user = await currentUserId();
    const { data, error } = await supabase.from('reviews').select('*').eq('reviewee_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const reviewsWrittenQuery = () => queryOptions({
  queryKey: ['reviews', 'written'],
  queryFn: async () => {
    const user = await currentUserId();
    const { data, error } = await supabase.from('reviews').select('*').eq('reviewer_id', user.id);
    if (error) throw error;
    return data;
  },
});

export const myApplicationsQuery = () => queryOptions({
  queryKey: ['applications', 'mine'],
  queryFn: async () => {
    const user = await currentUserId();
    const { data, error } = await supabase.from('applications').select('*, project:projects(*)').eq('student_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const myProjectsQuery = () => queryOptions({
  queryKey: ['projects', 'mine'],
  queryFn: async () => {
    const user = await currentUserId();
    const { data: projects, error } = await supabase.from('projects').select('*, applications(*)').eq('owner_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    const studentIds = [...new Set(projects.flatMap(p => p.applications.map(a => a.student_id)))];
    const { data: students, error: sErr } = studentIds.length ? await supabase.from('profiles').select('*').in('id', studentIds) : { data: [] as Profile[], error: null };
    if (sErr) throw sErr;
    return { projects, students: Object.fromEntries((students ?? []).map(s => [s.id, s])) as Record<string, Profile> };
  },
});

export const publishedProjectsQuery = () => queryOptions({
  queryKey: ['projects', 'published'],
  queryFn: async () => {
    const { data, error } = await supabase.from('projects').select('*').not('owner_id', 'is', null).eq('status', 'open').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
});
