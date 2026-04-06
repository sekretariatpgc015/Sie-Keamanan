import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (!amount || amount === 0) return 'Rp -';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);
  
  if (isNegative) {
    return `Rp (${formattedNumber})`;
  }
  return `Rp ${formattedNumber}`;
}
