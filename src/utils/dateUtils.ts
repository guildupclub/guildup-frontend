/**
 * Utility functions for handling dates in a timezone-safe manner
 */

/**
 * Safely parse a date string in YYYY-MM-DD format to avoid timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format a date to YYYY-MM-DD string format safely
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date for display using locale-specific formatting
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseDateString(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a date is today or in the future
 * @param date - Date object to check
 * @returns true if date is today or in the future
 */
export const isDateSelectable = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Compare two dates for equality (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if dates are the same day
 */
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
}; 