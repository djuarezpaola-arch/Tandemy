import { describe, expect, it } from 'vitest';
import { studentProfileData } from '@/lib/student-registration';

describe('Student profiles', () => {
  it('keeps the student profile fields supplied at signup', () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({ display_name: 'Ana López', student_number: '123456', degree: 'Contador Público', semester: '6' })) form.set(key, value);
    expect(studentProfileData(form)).toEqual({ display_name: 'Ana López', student_number: '123456', degree: 'Contador Público', semester: '6' });
  });
});