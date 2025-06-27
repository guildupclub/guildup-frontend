import { cn } from '@/lib/utils';

// Re-export the cn function for convenience
export { cn };

/**
 * Parse community ID and name from URL parameter
 */
export function parseCommunityParam(communityParam: string) {
  if (!communityParam) return { communityId: null, communityName: null };
  
  const lastHyphenIndex = communityParam.lastIndexOf('-');
  if (lastHyphenIndex === -1) return { communityId: null, communityName: null };
  
  const communityName = communityParam.substring(0, lastHyphenIndex);
  const communityId = communityParam.substring(lastHyphenIndex + 1);
  
  return { communityId, communityName };
}

/**
 * Create community URL parameter from name and ID
 */
export function createCommunityParam(name: string, id: string) {
  const cleanedName = name
    .replace(/\s+/g, '-')
    .replace(/\|/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  
  return `${cleanedName}-${id}`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string, maxLength = 2) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
}

/**
 * Generate a random ID
 */
export function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned = {} as any;
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Check if user has permission
 */
export function hasPermission(userRole: string, requiredRole: string) {
  const roleHierarchy = ['member', 'moderator', 'owner'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Extract text content from HTML
 */
export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if URL is valid
 */
export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Generate avatar URL from name if no image provided
 */
export function getAvatarUrl(name: string, image?: string) {
  if (image) return image;
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`;
} 