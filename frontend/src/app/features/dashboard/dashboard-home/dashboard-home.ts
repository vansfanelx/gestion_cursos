import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';
import { Cursos } from '../../../core/services/cursos';
import { FilterPipe } from '../../../shared/pipes/filter-pipe';

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
    this.cursosService.getAll().subscribe({
      next: (cursos: any[]) => {
        console.log('Datos de profesor cargados:', cursos);
        // Filtrar solo los cursos del profesor
        this.misCursos = cursos.filter(c => c.profesor_id === this.currentUser.id);
        // Calcular total de estudiantes (esto vendría mejor del backend)
        this.totalEstudiantes = 0; // Por ahora
        this.loading = false;
        console.log('Loading establecido a false');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando cursos:', err);
        this.loading = false;
        console.log('Loading establecido a false (error)');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  loadAdminData() {
    console.log('Cargando datos de admin...');
    // El admin ve estadísticas generales
    this.cursosService.getAll().subscribe({
      next: (cursos: any[]) => {
        console.log('Datos de admin cargados:', cursos);
        this.totalCursos = cursos.length;
        // Estos datos deberían venir de endpoints específicos
        this.totalProfesores = 0;
        this.totalAlumnos = 0;
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
      'inscrito': 'badge-info',
      'en_progreso': 'badge-warning',
      'completado': 'badge-success',
      'abandonado': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoTexto(estado: string): string {
    const textos: any = {
      'inscrito': 'Inscrito',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'abandonado': 'Abandonado'
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
