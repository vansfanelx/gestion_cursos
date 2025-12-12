import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Inscripciones, Inscripcion } from '../../../core/services/inscripciones';
import { Cursos } from '../../../core/services/cursos';
import { Usuarios } from '../../../core/services/usuarios';

@Component({
  selector: 'app-form-inscripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private inscripcionesService: Inscripciones,
    private cursosService: Cursos,
    private usuariosService: Usuarios,
    private cdr: ChangeDetectorRef
  ) {
    this.inscripcionForm = this.fb.group({
      estudiante_id: ['', Validators.required],
      curso_id: ['', Validators.required],
      estado: ['inscrito', Validators.required],
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
          nota_final: data.nota_final
        });
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

  onSubmit(): void {
    if (this.inscripcionForm.invalid) {
      Object.keys(this.inscripcionForm.controls).forEach(key => {
        this.inscripcionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = {
      ...this.inscripcionForm.value,
      nota_final: this.inscripcionForm.value.nota_final || null
    };

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
      this.inscripcionesService.inscribirse(formData.curso_id).subscribe({
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
}
