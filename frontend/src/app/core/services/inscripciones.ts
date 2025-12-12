import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Inscripcion {
  id: number;
  estudiante_id: number;
  curso_id: number;
  estado: 'inscrito' | 'en_progreso' | 'completado' | 'abandonado';
  nota_final?: number;
  fecha_inscripcion: string;
  fecha_finalizacion?: string;
  estudiante?: {
    id: number;
    name: string;
    email: string;
  };
  curso?: {
    id: number;
    nombre: string;
    descripcion: string;
    duracion: number;
    profesor?: {
      id: number;
      name: string;
    };
  };
}

export interface CursoDisponible {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  profesor: {
    id: number;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class Inscripciones {
  private apiUrl = `${environment.apiUrl}/inscripciones`;
  
  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las inscripciones (filtradas por rol en backend)
   */
  getAll(): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener una inscripción específica
   */
  getById(id: number): Observable<Inscripcion> {
    return this.http.get<Inscripcion>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Inscribirse en un curso (estudiante)
   */
  inscribirse(cursoId: number): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.apiUrl, { curso_id: cursoId }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar inscripción (estado/nota - profesor/admin)
   */
  update(id: number, data: Partial<Inscripcion>): Observable<Inscripcion> {
    return this.http.put<Inscripcion>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cancelar inscripción
   */
  cancelar(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtener cursos disponibles para inscripción (estudiante)
   */
  getCursosDisponibles(): Observable<CursoDisponible[]> {
    return this.http.get<CursoDisponible[]>(`${environment.apiUrl}/cursos-disponibles`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en InscripcionesService:', error);
    const friendlyMessage = error.error?.message || 'Error al procesar la solicitud';
    const errorWithMessage = { ...error, friendlyMessage };
    return throwError(() => errorWithMessage);
  }
}
