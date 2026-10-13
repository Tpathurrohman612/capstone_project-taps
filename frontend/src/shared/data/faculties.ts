export const FACULTIES = [
  'Fakultas Ekonomi dan Bisnis',
  'Fakultas Hukum, Ilmu Sosial, dan Ilmu Politik',
  'Fakultas Keguruan dan Ilmu Pendidikan',
  'Fakultas Sains dan Teknologi',
] as const

export type Faculty = (typeof FACULTIES)[number]
