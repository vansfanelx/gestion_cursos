import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Inscripciones, CursoDisponible, Inscripcion } from '../../../core/services/inscripciones';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-cursos-disponibles',
  standalone: true,
  imports: [CommonModule, ConfirmModal],
  templateUrl: './cursos-disponibles.html',
  styleUrl: './cursos-disponibles.css'
})
export class CursosDisponibles implements OnInit {
  cursosDisponibles: CursoDisponible[] = [];
  misSolicitudes: Inscripcion[] = [];
  loading = true;
  error = '';
  successMessage = '';

  // Modal state
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Aceptar';
  modalDanger = false;
  modalAction: (() => void) | null = null;

  constructor(
    private inscripcionesService: Inscripciones,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';

    // Cargar ambos datos en paralelo
    forkJoin({
      cursos: this.inscripcionesService.getCursosDisponibles(),
      inscripciones: this.inscripcionesService.getAll()
    }).subscribe({
      next: (result) => {
        console.log('Datos cargados:', result);
        this.cursosDisponibles = result.cursos;
        this.misSolicitudes = result.inscripciones;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.error = err.friendlyMessage || 'Error al cargar datos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarMisSolicitudes(): void {
    // Cargar solo inscripciones
    this.inscripcionesService.getAll().subscribe({
      next: (inscripciones) => {
        this.misSolicitudes = inscripciones;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
      }
    });
  }

  solicitarInscripcion(curso: CursoDisponible): void {
    this.modalTitle = 'Solicitar Inscripción';
    this.modalMessage = `¿Deseas solicitar inscripción al curso <strong>"${curso.nombre}"</strong>?`;
    this.modalConfirmText = 'Solicitar';
    this.modalDanger = false;
    this.modalAction = () => {
      this.inscripcionesService.inscribirse(curso.id).subscribe({
        next: (response) => {
          this.successMessage = `Solicitud enviada para "${curso.nombre}". Espera la aprobación del administrador.`;
          this.cursosDisponibles = this.cursosDisponibles.filter(c => c.id !== curso.id);
          this.cargarMisSolicitudes();
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          this.error = err.friendlyMessage || 'Error al enviar solicitud';
          setTimeout(() => this.error = '', 5000);
        }
      });
    };
    this.showModal = true;
  }

  cancelarSolicitud(inscripcion: Inscripcion): void {
    this.modalTitle = 'Cancelar Solicitud';
    this.modalMessage = `¿Estás seguro de cancelar la solicitud para <strong>"${inscripcion.curso?.nombre}"</strong>?`;
    this.modalConfirmText = 'Cancelar Solicitud';
    this.modalDanger = true;
    this.modalAction = () => {
      this.inscripcionesService.cancelar(inscripcion.id).subscribe({
        next: () => {
          this.successMessage = 'Solicitud cancelada';
          this.cargarDatos();
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (err) => {
          this.error = err.friendlyMessage || 'Error al cancelar solicitud';
          setTimeout(() => this.error = '', 5000);
        }
      });
    };
    this.showModal = true;
  }

  onModalConfirm(): void {
    this.showModal = false;
    if (this.modalAction) {
      this.modalAction();
    }
  }

  onModalCancel(): void {
    this.showModal = false;
    this.modalAction = null;
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
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
    const textos: Record<string, string> = {
      'pendiente': 'Pendiente de Aprobación',
      'inscrito': 'Inscrito',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'abandonado': 'Abandonado',
      'rechazado': 'Rechazado'
    };
    return textos[estado] || estado;
  }

  get solicitudesPendientes(): Inscripcion[] {
    return this.misSolicitudes.filter(s => s.estado === 'pendiente');
  }

  get inscripcionesActivas(): Inscripcion[] {
    return this.misSolicitudes.filter(s => ['inscrito', 'en_progreso'].includes(s.estado));
  }

  get inscripcionesFinalizadas(): Inscripcion[] {
    return this.misSolicitudes.filter(s => ['completado', 'abandonado', 'rechazado'].includes(s.estado));
  }
}
