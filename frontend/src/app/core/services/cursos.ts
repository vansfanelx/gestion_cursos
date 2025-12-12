import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso, CursoRequest } from '../models/curso.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Cursos {
  private apiUrl = `${environment.apiUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  getById(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  create(curso: CursoRequest): Observable<any> {
    return this.http.post(this.apiUrl, curso);
  }

  update(id: number, curso: Partial<CursoRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, curso);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  inscribir(cursoId: number, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${cursoId}/inscribir`, { usuario_id: usuarioId });
  }
}

