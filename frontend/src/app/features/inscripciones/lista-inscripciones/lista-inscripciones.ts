import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-lista-inscripciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModal],
  templateUrl: './lista-inscripciones.html',
  styleUrl: './lista-inscripciones.css'
})
export class ListaInscripciones implements OnInit {
  inscripciones: Inscripcion[] = [];
  loading = true;
  error = '';
  
  filtroEstado = 'todos';
  searchText = '';
  
  // Modal de confirmación
  showDeleteModal = false;
  inscripcionToDelete: number | null = null;

  constructor(
    private inscripcionesService: Inscripciones,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    console.log('Token en localStorage:', token ? 'Sí existe' : 'No existe');
    if (!token) {
      this.error = 'No hay token de autenticación. Por favor, inicia sesión.';
      this.loading = false;
      return;
    }
    this.loadInscripciones();
  }

  loadInscripciones(): void {
    this.loading = true;
    this.error = '';
    console.log('Iniciando carga de inscripciones...');
    
    this.inscripcionesService.getAll().subscribe({
      next: (data) => {
        console.log('Inscripciones cargadas:', data);
        console.log('Cantidad de inscripciones:', data.length);
        this.inscripciones = data;
        this.loading = false;
        console.log('Loading después de cargar:', this.loading);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 401) {
          this.error = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al cargar las inscripciones: ${err.message || 'Error desconocido'}`;
        }
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        console.error('Error:', err);
      }
    });
  }

  get filteredInscripciones(): Inscripcion[] {
    let filtered = this.inscripciones;
    
    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      filtered = filtered.filter(i => i.estado === this.filtroEstado);
    }
    
    // Filtrar por búsqueda de texto
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(i => 
        i.estudiante?.name.toLowerCase().includes(search) ||
        i.curso?.nombre.toLowerCase().includes(search) ||
        i.curso?.profesor?.name.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/inscripciones', id]);
  }

  editInscripcion(id: number): void {
    this.router.navigate(['/inscripciones/editar', id]);
  }

  deleteInscripcion(id: number): void {
    this.inscripcionToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.inscripcionToDelete) {
      this.inscripcionesService.cancelar(this.inscripcionToDelete).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.inscripcionToDelete = null;
          this.loadInscripciones();
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          this.error = 'Error al eliminar la inscripción';
          this.showDeleteModal = false;
          this.inscripcionToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.inscripcionToDelete = null;
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: {[key: string]: string} = {
      'inscrito': 'badge-inscrito',
      'en_progreso': 'badge-progreso',
      'completado': 'badge-completado',
      'abandonado': 'badge-abandonado'
    };
    return classes[estado] || 'badge-inscrito';
  }

  getEstadoLabel(estado: string): string {
    const labels: {[key: string]: string} = {
      'inscrito': 'Inscrito',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'abandonado': 'Abandonado'
    };
    return labels[estado] || estado;
  }
}
