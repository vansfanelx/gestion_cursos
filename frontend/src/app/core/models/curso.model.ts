import { User } from './user.model';

export interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  profesor_id: number;
  profesor?: User;
  created_at?: string;
  updated_at?: string;
}

export interface CursoRequest {
  nombre: string;
  descripcion: string;
  duracion: number;
  profesor_id: number;
}
