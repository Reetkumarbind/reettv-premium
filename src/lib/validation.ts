import { z } from 'zod';
import DOMPurify from 'dompurify';

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and numbers'
  ),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

export const UpdatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  autoplay: z.boolean().optional(),
  quality: z.enum(['auto', '1080p', '720p', '480p']).optional(),
  notifications_enabled: z.boolean().optional(),
  keyboard_shortcuts: z.boolean().optional(),
});

export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  logo: z.string().url().optional(),
  group: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
});

export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
});

// Type inference
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;

// Security utilities
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .slice(0, 1000)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const validateURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];

  return (): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }

    if (requests.length < maxRequests) {
      requests.push(now);
      return true;
    }

    return false;
  };
};

// API validation middleware
export const validateApiResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
