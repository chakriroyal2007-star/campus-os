export const API_BASE = '/api/v1';

export interface UserSession {
  token: string;
  userId: string;
  institutionId: string;
  institutionName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  studentProfileId?: string;
  teacherProfileId?: string;
  studentIdNumber?: string;
  facultyIdNumber?: string;
  departmentName?: string;
  programName?: string;
  currentSemester?: number;
  section?: string;
}

export function getStoredUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('campusos_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserSession | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('campusos_user', JSON.stringify(user));
    localStorage.setItem('campusos_token', user.token);
  } else {
    localStorage.removeItem('campusos_user');
    localStorage.removeItem('campusos_token');
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('campusos_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMessage = errJson.message || errJson.error || errorMessage;
    } catch {}

    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('campusos_user');
      localStorage.removeItem('campusos_token');
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Unexpected non-JSON response from server');
  }
}
