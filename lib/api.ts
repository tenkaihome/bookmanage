import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://logbook-kohl-one.vercel.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: string;
  details: any;
  file_url: string;
  cover_url: string;
  created_at: string;
}

export const getBooks = () => api.get<Book[]>('/books');
export const getBook = (id: string) => api.get<Book>(`/books/${id}`);
export const createBook = (formData: FormData) => api.post('/books', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateBook = (id: string, data: Partial<Book>) => api.put(`/books/${id}`, data);
export const deleteBook = (id: string) => api.delete(`/books/${id}`);
