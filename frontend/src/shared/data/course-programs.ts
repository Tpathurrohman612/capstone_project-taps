import type { Faculty } from './faculties'

export type CourseProgram = {
  programStudy: string
  faculty: Faculty
}

// Keyed by the four-letter prefix of a Universitas Terbuka course code, so
// 'ESPA4123 · Statistika Ekonomi' resolves through 'ESPA'.
//
// MKDU courses are university-wide general courses that belong to no single
// program study, so they are intentionally absent: an unlisted prefix resolves
// to undefined instead of being folded into an unrelated program study.
export const COURSE_PROGRAMS: Record<string, CourseProgram> = {
  ADBI: {
    programStudy: 'Administrasi Bisnis',
    faculty: 'Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik',
  },
  AKUN: { programStudy: 'Akuntansi', faculty: 'Fakultas Ekonomi dan Bisnis' },
  EKMA: { programStudy: 'Manajemen', faculty: 'Fakultas Ekonomi dan Bisnis' },
  ESPA: { programStudy: 'Ekonomi Pembangunan', faculty: 'Fakultas Ekonomi dan Bisnis' },
  PAJA: { programStudy: 'Akuntansi Keuangan Publik', faculty: 'Fakultas Ekonomi dan Bisnis' },
}

export const courseProgram = (course: string): CourseProgram | undefined =>
  COURSE_PROGRAMS[course.slice(0, 4).toUpperCase()]
