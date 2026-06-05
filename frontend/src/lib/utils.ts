import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getConfidenceColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
};

export const getConfidenceBg = (score: number) => {
  if (score >= 90) return 'bg-emerald-400/10 border-emerald-400/20';
  if (score >= 70) return 'bg-amber-400/10 border-amber-400/20';
  return 'bg-red-400/10 border-red-400/20';
};

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-IN').format(n);

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(d));
