import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with the clsx utility and applies the Tailwind merge function
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  }
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Truncate a string to a specified length and add ellipsis
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a camelCase or snake_case string to title case with spaces
 */
export function formatStringToTitleCase(str: string): string {
  if (!str) return "";
  // Handle camelCase
  const spacedString = str.replace(/([A-Z])/g, " $1");
  // Handle snake_case
  const withoutUnderscores = spacedString.replace(/_/g, " ");
  // Capitalize first letter and trim
  return capitalizeFirstLetter(withoutUnderscores.trim());
}

/**
 * Generate a random color for avatars or visual elements
 */
export function getRandomColor(seed?: string): string {
  const colors = [
    "bg-primary/10",
    "bg-secondary/20",
    "bg-blue-500/10",
    "bg-green-500/10",
    "bg-yellow-500/10",
    "bg-purple-500/10",
    "bg-pink-500/10",
    "bg-indigo-500/10",
  ];

  if (!seed) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Use the seed to deterministically choose a color
  let sum = 0;
  for (let i = 0; i < seed.length; i++) {
    sum += seed.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}