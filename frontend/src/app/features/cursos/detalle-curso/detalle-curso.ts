import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Cursos } from '../../../core/services/cursos';
import { Auth } from '../../../core/services/auth';

interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  profesor_id: number;
  profesor?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
}

@Component({
  selector: 'app-detalle-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './detalle-curso.html',
  styleUrl: './detalle-curso.css',
})
export class DetalleCurso implements OnInit {
  curso: Curso | null = null;
  loading = true;
  error = '';
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cursosService: Cursos,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadCurso(id);
    } else {
      this.error = 'ID de curso inválido';
      this.loading = false;
    }
  }

  loadCurso(id: number) {
    this.loading = true;
    this.cursosService.getById(id).subscribe({
      next: (data) => {
        this.curso = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al cargar el curso';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver() {
    this.router.navigate(['/cursos']);
  }

  editar() {
    this.router.navigate(['/cursos/editar', this.curso?.id]);
  }

  canEdit(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'profesor';
  }
}
