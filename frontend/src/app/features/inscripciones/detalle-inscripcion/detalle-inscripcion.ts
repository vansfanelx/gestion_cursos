import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';

@Component({
  selector: 'app-detalle-inscripcion',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './detalle-inscripcion.html',
  styleUrl: './detalle-inscripcion.css'
})
export class DetalleInscripcion implements OnInit {
  inscripcion: Inscripcion | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inscripcionesService: Inscripciones,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.loadInscripcion(id);
    } else {
      this.error = 'ID de inscripción inválido';
      this.loading = false;
    }
  }

  loadInscripcion(id: number): void {
    this.loading = true;
    this.inscripcionesService.getById(id).subscribe({
      next: (data) => {
        this.inscripcion = data;
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar la inscripción';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        console.error('Error:', err);
      }
    });
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

  volver(): void {
    this.router.navigate(['/inscripciones']);
  }

  editar(): void {
    this.router.navigate(['/inscripciones/editar', this.inscripcion?.id]);
  }
}
