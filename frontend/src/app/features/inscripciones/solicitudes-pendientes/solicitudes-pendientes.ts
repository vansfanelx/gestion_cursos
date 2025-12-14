import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Inscripciones, SolicitudPendiente } from '../../../core/services/inscripciones';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-solicitudes-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModal],
  templateUrl: './solicitudes-pendientes.html',
  styleUrl: './solicitudes-pendientes.css'
})
export class SolicitudesPendientes implements OnInit {
  solicitudes: SolicitudPendiente[] = [];
  loading = true;
  error = '';
  successMessage = '';
  
  // Para el modal de rechazo
  showRechazarModal = false;
  solicitudSeleccionada: SolicitudPendiente | null = null;
  motivoRechazo = '';

  // Para el modal de confirmación de aprobación
  showAprobarModal = false;
  solicitudAprobar: SolicitudPendiente | null = null;

  constructor(
    private inscripcionesService: Inscripciones,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';

    this.inscripcionesService.getSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al cargar solicitudes';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aprobar(solicitud: SolicitudPendiente): void {
    this.solicitudAprobar = solicitud;
    this.showAprobarModal = true;
  }

  confirmarAprobacion(): void {
    if (!this.solicitudAprobar) return;
    
    const solicitud = this.solicitudAprobar;
    this.showAprobarModal = false;
    this.solicitudAprobar = null;

    this.inscripcionesService.aprobarSolicitud(solicitud.id).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.solicitudes = this.solicitudes.filter(s => s.id !== solicitud.id);
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al aprobar solicitud';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  cancelarAprobacion(): void {
    this.showAprobarModal = false;
    this.solicitudAprobar = null;
  }

  abrirModalRechazo(solicitud: SolicitudPendiente): void {
    this.solicitudSeleccionada = solicitud;
    this.motivoRechazo = '';
    this.showRechazarModal = true;
  }

  cerrarModalRechazo(): void {
    this.showRechazarModal = false;
    this.solicitudSeleccionada = null;
    this.motivoRechazo = '';
  }

  confirmarRechazo(): void {
    if (!this.solicitudSeleccionada) return;

    const motivo = this.motivoRechazo.trim() || 'Solicitud rechazada por el administrador';
    
    this.inscripcionesService.rechazarSolicitud(this.solicitudSeleccionada.id, motivo).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.solicitudes = this.solicitudes.filter(s => s.id !== this.solicitudSeleccionada?.id);
        this.cerrarModalRechazo();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al rechazar solicitud';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
