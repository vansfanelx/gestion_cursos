import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Inscripcion {
  id: number;
  estudiante_id: number;
  curso_id: number;
  estado: 'pendiente' | 'inscrito' | 'en_progreso' | 'completado' | 'abandonado' | 'rechazado';
  nota_parcial?: number;
  nota_final?: number;
  promedio?: number;
  fecha_solicitud?: string;
  fecha_inscripcion?: string;
  fecha_finalizacion?: string;
  motivo_rechazo?: string;
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

export interface SolicitudPendiente extends Inscripcion {}

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
   * Crear inscripción directa (admin)
   */
  create(data: { estudiante_id: number; curso_id: number }): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.apiUrl, data).pipe(
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
   * Obtener solicitudes pendientes (admin)
   */
  getSolicitudesPendientes(): Observable<SolicitudPendiente[]> {
    return this.http.get<SolicitudPendiente[]>(`${environment.apiUrl}/solicitudes-pendientes`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Aprobar solicitud de inscripción (admin)
   */
  aprobarSolicitud(id: number): Observable<{message: string, inscripcion: Inscripcion}> {
    return this.http.post<{message: string, inscripcion: Inscripcion}>(`${this.apiUrl}/${id}/aprobar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Rechazar solicitud de inscripción (admin)
   */
  rechazarSolicitud(id: number, motivo?: string): Observable<{message: string, inscripcion: Inscripcion}> {
    return this.http.post<{message: string, inscripcion: Inscripcion}>(`${this.apiUrl}/${id}/rechazar`, { motivo }).pipe(
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
