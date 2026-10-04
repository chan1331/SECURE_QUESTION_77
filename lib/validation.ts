import { UserRole } from '@/types/auth';

const VALID_ROLES: UserRole[] = [
  'Question Setter',
  'Reviewer',
  'Examination Authority',
  'Examination Center',
  'Admin',
];

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6; // minimum secure length
}

export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function sanitizeString(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim();
}

export function validatePaperCreation(data: {
  title?: unknown;
  content?: unknown;
  examDate?: unknown;
  examTime?: unknown;
}): { valid: boolean; error?: string } {
  const title = sanitizeString(data.title);
  const content = sanitizeString(data.content);

  if (!title || title.length < 3) {
    return { valid: false, error: 'Title is required and must be at least 3 characters.' };
  }
  if (!content || content.length < 10) {
    return { valid: false, error: 'Question paper content must be at least 10 characters long.' };
  }

  return { valid: true };
}

export function validateSchedule(data: {
  examTime?: unknown;
}): { valid: boolean; error?: string; parsedDate?: Date } {
  if (!data.examTime) {
    return { valid: false, error: 'Scheduled examination date and time is required.' };
  }

  const parsed = new Date(String(data.examTime));
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid date/time format provided for exam schedule.' };
  }

  return { valid: true, parsedDate: parsed };
}

export function validateReleaseRequest(data: {
  paperId?: unknown;
  deviceId?: unknown;
}): { valid: boolean; error?: string; cleanPaperId?: string; cleanDeviceId?: string } {
  const paperId = sanitizeString(data.paperId);
  const deviceId = sanitizeString(data.deviceId);

  if (!paperId) {
    return { valid: false, error: 'Paper ID is required.' };
  }
  if (!deviceId) {
    return { valid: false, error: 'Authorized Device ID is required.' };
  }

  return { valid: true, cleanPaperId: paperId, cleanDeviceId: deviceId };
}
