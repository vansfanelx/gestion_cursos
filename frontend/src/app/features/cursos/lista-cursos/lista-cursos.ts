import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Cursos } from '../../../core/services/cursos';
import { SearchFilterPipe } from '../../../shared/pipes/search-filter-pipe';
import { Auth } from '../../../core/services/auth';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

interface Curso {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  profesor_id: number;
  profesor?: {
    id: number;
    name: string;
  };
}

@Component({
  selector: 'app-lista-cursos',
  standalone: true,
  imports: [RouterModule, FormsModule, SearchFilterPipe, ConfirmModal],
  templateUrl: './lista-cursos.html',
  styleUrl: './lista-cursos.css',
})
export class ListaCursos implements OnInit {
  cursos: Curso[] = [];
  loading = true;
  error = '';
  searchText = '';
  currentUser: any = null;
  
  // Modal properties
  showModal = false;
  modalData = {
    title: '',
    message: '',
    cursoId: 0,
    cursoNombre: ''
  };
  
  constructor(
    private cursosService: Cursos,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isProfesor(): boolean {
    return this.currentUser?.role === 'profesor';
  }

  get pageTitle(): string {
    return this.isProfesor ? '📚 Mis Cursos' : '📚 Gestión de Cursos';
  }

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    console.log('Token en localStorage:', token ? 'Sí existe' : 'No existe');
    if (!token) {
      this.error = 'No hay token de autenticación. Por favor, inicia sesión.';
      this.loading = false;
      return;
    }
    
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
    });
    
    this.loadCursos();
  }

  loadCursos() {
    this.loading = true;
    this.error = '';
    console.log('Iniciando carga de cursos...');
    this.cursosService.getAll().subscribe({
      next: (data: Curso[]) => {
        console.log('Cursos cargados:', data);
        this.cursos = data;
        this.loading = false;
        console.log('Loading después de cargar:', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        this.error = err.friendlyMessage || 'Error al cargar los cursos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCurso(id: number, nombre: string) {
    this.modalData = {
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el curso "${nombre}"? Esta acción no se puede deshacer.`,
      cursoId: id,
      cursoNombre: nombre
    };
    this.showModal = true;
  }

  onConfirmDelete() {
    this.showModal = false;
    this.loading = true;
    
    this.cursosService.delete(this.modalData.cursoId).subscribe({
      next: () => {
        this.cursos = this.cursos.filter(c => c.id !== this.modalData.cursoId);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al eliminar el curso';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  onCancelDelete() {
    this.showModal = false;
  }

  verDetalle(id: number) {
    this.router.navigate(['/cursos', id]);
  }

  canCreate(): boolean {
    return this.isAdmin;
  }

  canEdit(): boolean {
    return this.isAdmin; // Solo admin puede editar cursos
  }

  canDelete(): boolean {
    return this.isAdmin;
  }
}
