export function studentProfileData(form: FormData) {
  return {
    display_name: String(form.get('display_name') ?? '').trim(),
    student_number: String(form.get('student_number') ?? '').trim(),
    degree: String(form.get('degree') ?? '').trim(),
    semester: String(form.get('semester') ?? '').trim(),
  };
}