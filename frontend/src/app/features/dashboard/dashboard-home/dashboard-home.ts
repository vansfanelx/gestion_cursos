import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';
import { Cursos } from '../../../core/services/cursos';
import { Usuarios } from '../../../core/services/usuarios';
import { FilterPipe } from '../../../shared/pipes/filter-pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FilterPipe],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  currentUser: any = null;
  userRole: string = '';
  loading = true;
  
  // Datos del estudiante
  misInscripciones: Inscripcion[] = [];
  
  // Datos del profesor
  misCursos: any[] = [];
  totalEstudiantes = 0;
  
  // Datos del admin
  totalCursos = 0;
  totalProfesores = 0;
  totalAlumnos = 0;

  constructor(
    private authService: Auth,
    private inscripcionesService: Inscripciones,
    private cursosService: Cursos,
    private usuariosService: Usuarios,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    this.currentUser = this.authService.currentUserValue;
    this.userRole = this.authService.getUserRole();
    
    // Pequeño delay para asegurar que Angular detecta el cambio
    setTimeout(() => {
      this.loadDashboardData();
    }, 0);
  }

  loadDashboardData() {
    if (this.userRole === 'estudiante') {
      this.loadEstudianteData();
    } else if (this.userRole === 'profesor') {
      this.loadProfesorData();
    } else if (this.userRole === 'admin') {
      this.loadAdminData();
    } else {
      // Si no hay rol, detener el loading
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadEstudianteData() {
    console.log('Cargando datos de estudiante...');
    this.inscripcionesService.getAll().subscribe({
      next: (inscripciones) => {
        console.log('Datos de estudiante cargados:', inscripciones);
        this.misInscripciones = inscripciones;
        this.loading = false;
        console.log('Loading establecido a false');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando inscripciones:', err);
        this.loading = false;
        console.log('Loading establecido a false (error)');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  loadProfesorData() {
    console.log('Cargando datos de profesor...');
    // Cargar cursos y inscripciones en paralelo
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        cursos: this.cursosService.getAll(),
        inscripciones: this.inscripcionesService.getAll()
      }).subscribe({
        next: (data: any) => {
          console.log('Datos de profesor cargados:', data);
          this.misCursos = data.cursos;
          // Contar estudiantes únicos de todas las inscripciones
          const estudiantesUnicos = new Set(data.inscripciones.map((i: any) => i.estudiante_id));
          this.totalEstudiantes = estudiantesUnicos.size;
          this.loading = false;
          console.log('Loading establecido a false');
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          this.loading = false;
          console.log('Loading establecido a false (error)');
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }
      });
    });
  }

  loadAdminData() {
    console.log('Cargando datos de admin...');
    // Cargar cursos y usuarios en paralelo
    forkJoin({
      cursos: this.cursosService.getAll(),
      usuarios: this.usuariosService.getAll()
    }).subscribe({
      next: (data: any) => {
        console.log('Datos de admin cargados:', data);
        this.totalCursos = data.cursos.length;
        // Contar profesores y estudiantes
        this.totalProfesores = data.usuarios.filter((u: any) => u.role === 'profesor').length;
        this.totalAlumnos = data.usuarios.filter((u: any) => u.role === 'estudiante').length;
        this.loading = false;
        console.log('Loading establecido a false, totalCursos:', this.totalCursos);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando datos del admin:', err);
        // Aunque falle, mostrar el dashboard con valores en 0
        this.totalCursos = 0;
        this.totalProfesores = 0;
        this.totalAlumnos = 0;
        this.loading = false;
        console.log('Loading establecido a false (error)');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'pendiente': 'badge-warning',
      'inscrito': 'badge-info',
      'en_progreso': 'badge-primary',
      'completado': 'badge-success',
      'abandonado': 'badge-secondary',
      'rechazado': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: any = {
      'pendiente': 'Pendiente',
      'inscrito': 'Inscrito',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'abandonado': 'Abandonado',
      'rechazado': 'Rechazado'
    };
    return textos[estado] || estado;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  verCursosDisponibles() {
    this.router.navigate(['/cursos-disponibles']);
  }
}
