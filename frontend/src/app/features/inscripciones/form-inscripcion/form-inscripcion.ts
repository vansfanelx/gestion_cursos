import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';
import { Cursos } from '../../../core/services/cursos';
import { Usuarios } from '../../../core/services/usuarios';
import { SearchSelect } from '../../../shared/components/search-select/search-select';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SearchSelect],
  templateUrl: './form-inscripcion.html',
  styleUrl: './form-inscripcion.css'
})
export class FormInscripcion implements OnInit {
  inscripcionForm: FormGroup;
  isEditMode = false;
  inscripcionId: number | null = null;
  loading = false;
  error = '';
  
  cursos: any[] = [];
  estudiantes: any[] = [];
  selectedEstudianteId: number | null = null;
  selectedCursoId: number | null = null;
  marcarAbandonado = false;
  estadoActual = 'inscrito';

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inscripcionesService: Inscripciones,
    private cursosService: Cursos,
    private usuariosService: Usuarios,
    private cdr: ChangeDetectorRef,
    private authService: Auth
  ) {
    this.inscripcionForm = this.fb.group({
      estudiante_id: ['', Validators.required],
      curso_id: ['', Validators.required],
      estado: ['inscrito', Validators.required],
      nota_parcial: [''],
      nota_final: ['']
    });
  }

  ngOnInit(): void {
    this.loadCursos();
    this.loadEstudiantes();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.inscripcionId = Number(id);
      this.loadInscripcion(this.inscripcionId);
    }
  }

  loadCursos(): void {
    this.cursosService.getAll().subscribe({
      next: (data) => {
        this.cursos = data;
      },
      error: (err: any) => {
        console.error('Error al cargar cursos:', err);
      }
    });
  }

  loadEstudiantes(): void {
    this.usuariosService.getAll('estudiante').subscribe({
      next: (data) => {
        this.estudiantes = data;
      },
      error: (err: any) => {
        console.error('Error al cargar estudiantes:', err);
      }
    });
  }

  loadInscripcion(id: number): void {
    this.loading = true;
    this.inscripcionesService.getById(id).subscribe({
      next: (data) => {
        this.inscripcionForm.patchValue({
          estudiante_id: data.estudiante_id,
          curso_id: data.curso_id,
          estado: data.estado,
          nota_parcial: data.nota_parcial ?? null,
          nota_final: data.nota_final
        });
        this.selectedEstudianteId = data.estudiante_id;
        this.selectedCursoId = data.curso_id;
        this.estadoActual = data.estado;
        this.marcarAbandonado = data.estado === 'abandonado';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error al cargar la inscripción';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  onEstudianteSelected(id: number): void {
    this.selectedEstudianteId = id;
    this.inscripcionForm.get('estudiante_id')?.setValue(id);
    this.inscripcionForm.get('estudiante_id')?.markAsDirty();
    this.inscripcionForm.get('estudiante_id')?.updateValueAndValidity();
  }

  onCursoSelected(id: number): void {
    this.selectedCursoId = id;
    this.inscripcionForm.get('curso_id')?.setValue(id);
    this.inscripcionForm.get('curso_id')?.markAsDirty();
    this.inscripcionForm.get('curso_id')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.inscripcionForm.invalid) {
      Object.keys(this.inscripcionForm.controls).forEach(key => {
        this.inscripcionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    const formData: any = {
      nota_parcial: this.inscripcionForm.value.nota_parcial || null,
      nota_final: this.inscripcionForm.value.nota_final || null
    };
    
    // Solo enviar estado si es abandonado (manual)
    if (this.marcarAbandonado) {
      formData.estado = 'abandonado';
    }

    if (this.isEditMode && this.inscripcionId) {
      this.inscripcionesService.update(this.inscripcionId, formData).subscribe({
        next: () => {
          this.router.navigate(['/inscripciones']);
        },
        error: (err: any) => {
          this.error = err.friendlyMessage || 'Error al actualizar la inscripción';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Admin crea inscripción para un estudiante
      this.inscripcionesService.create({
        estudiante_id: this.inscripcionForm.value.estudiante_id,
        curso_id: this.inscripcionForm.value.curso_id
      }).subscribe({
        next: () => {
          this.router.navigate(['/inscripciones']);
        },
        error: (err: any) => {
          this.error = err.friendlyMessage || 'Error al crear la inscripción';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/inscripciones']);
  }

  // Promedio calculado en tiempo real (40% parcial, 60% final)
  get promedioCalculado(): number | null {
    const parcial = this.inscripcionForm.value.nota_parcial;
    const final = this.inscripcionForm.value.nota_final;
    if (parcial !== null && parcial !== '' && final !== null && final !== '') {
      const p = parseFloat(parcial);
      const f = parseFloat(final);
      if (!isNaN(p) && !isNaN(f)) {
        return parseFloat((p * 0.4 + f * 0.6).toFixed(2));
      }
    }
    return null;
  }

  // Estado calculado automáticamente según notas
  get estadoCalculado(): string {
    if (this.marcarAbandonado) return 'abandonado';
    const parcial = this.inscripcionForm.value.nota_parcial;
    const final = this.inscripcionForm.value.nota_final;
    const hasParcial = parcial !== null && parcial !== '';
    const hasFinal = final !== null && final !== '';
    if (hasParcial && hasFinal) return 'completado';
    if (hasParcial || hasFinal) return 'en_progreso';
    return 'inscrito';
  }

  get estadoLabel(): string {
    const labels: {[k:string]: string} = {
      'inscrito': '📝 Inscrito',
      'en_progreso': '📖 En Progreso',
      'completado': '✅ Completado',
      'abandonado': '❌ Abandonado'
    };
    return labels[this.estadoCalculado] || this.estadoCalculado;
  }

  get estadoBadgeClass(): string {
    const classes: {[k:string]: string} = {
      'inscrito': 'badge-inscrito',
      'en_progreso': 'badge-progreso',
      'completado': 'badge-completado',
      'abandonado': 'badge-abandonado'
    };
    return classes[this.estadoCalculado] || 'badge-inscrito';
  }

  get estadoHint(): string {
    if (this.marcarAbandonado) return 'El estudiante ha abandonado el curso';
    const parcial = this.inscripcionForm.value.nota_parcial;
    const final = this.inscripcionForm.value.nota_final;
    const hasParcial = parcial !== null && parcial !== '';
    const hasFinal = final !== null && final !== '';
    if (hasParcial && hasFinal) return 'Curso completado con ambas notas';
    if (hasParcial) return 'Falta nota final para completar';
    if (hasFinal) return 'Falta nota parcial para completar';
    return 'Sin notas registradas aún';
  }

  toggleAbandonado(event: any): void {
    this.marcarAbandonado = event.target.checked;
  }

  // Filtros simples para selects con búsqueda integrada
  filtroEstudiante = '';
  filtroCurso = '';
  get estudiantesFiltrados() {
    const q = this.filtroEstudiante.toLowerCase();
    if (!q) return this.estudiantes;
    return this.estudiantes.filter(e => (e.name || '').toLowerCase().includes(q));
  }
  get cursosFiltrados() {
    const q = this.filtroCurso.toLowerCase();
    if (!q) return this.cursos;
    return this.cursos.filter(c => (c.nombre || '').toLowerCase().includes(q));
  }
}
