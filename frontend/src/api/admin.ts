import { api } from './client';
import type { BucketListItem, Certificate, ContactMessage, Experience, Extracurricular, LoginResponse, Profile, Project, Skill, SocialLink, UploadResponse } from '../types';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}

export async function fetchSession(): Promise<LoginResponse> {
  const { data } = await api.get<LoginResponse>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const { data } = await api.put<Profile>('/profile', profile);
  return data;
}

export interface CrudApi<T extends { id?: number }> {
  list: () => Promise<T[]>;
  create: (item: T) => Promise<T>;
  update: (id: number, item: T) => Promise<T>;
  remove: (id: number) => Promise<void>;
  /** Saves a new order: every id, top first. */
  reorder?: (ids: number[]) => Promise<void>;
}

function crud<T extends { id?: number }>(path: string): CrudApi<T> {
  return {
    list: async () => (await api.get<T[]>(path)).data,
    create: async (item) => (await api.post<T>(path, item)).data,
    update: async (id, item) => (await api.put<T>(`${path}/${id}`, item)).data,
    remove: async (id) => {
      await api.delete(`${path}/${id}`);
    },
  };
}

export const experiencesApi = crud<Experience>('/experiences');
export const projectsApi = crud<Project>('/projects');
export const skillsApi = crud<Skill>('/skills');
export const certificatesApi = crud<Certificate>('/certificates');
export const extracurricularsApi = crud<Extracurricular>('/extracurriculars');
export const socialLinksApi = crud<SocialLink>('/social-links');
export const bucketListApi: CrudApi<BucketListItem> = {
  ...crud<BucketListItem>('/bucket-list'),
  reorder: async (ids) => {
    await api.put('/bucket-list/order', { ids });
  },
};

export const messagesApi = {
  list: async () => (await api.get<ContactMessage[]>('/contact')).data,
  setRead: async (id: number, read: boolean) => (await api.patch<ContactMessage>(`/contact/${id}`, { read })).data,
  remove: async (id: number) => {
    await api.delete(`/contact/${id}`);
  },
};

/** Uploads an image or PDF; the server stores it as a JPEG (PDFs: first page). */
export async function uploadImage(file: File, keepPdf: boolean, onProgress?: (pct: number) => void): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('keepPdf', String(keepPdf));
  const { data } = await api.post<UploadResponse>('/files/upload-image', form, {
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

export async function uploadFile(file: File, onProgress?: (pct: number) => void): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<UploadResponse>('/files/upload', form, {
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}
