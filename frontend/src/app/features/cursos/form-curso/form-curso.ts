import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Cursos } from '../../../core/services/cursos';
import { Usuarios } from '../../../core/services/usuarios';

@Component({
  selector: 'app-form-curso',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './form-curso.html',
  styleUrl: './form-curso.css',
})
export class FormCurso implements OnInit {
  cursoForm: FormGroup;
  isEditMode = false;
  cursoId?: number;
  loading = false;
  error = '';
  profesores: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cursosService: Cursos,
    private usuariosService: Usuarios,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.cursoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      duracion: ['', [Validators.required, Validators.min(1)]],
      profesor_id: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cursoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.cursoId && !isNaN(this.cursoId);
    this.loadProfesores();
    if (this.isEditMode) {
      this.loadCurso();
    }
  }

  loadCurso() {
    this.loading = true;
    this.cursosService.getById(this.cursoId!).subscribe({
      next: (data) => {
        this.cursoForm.patchValue(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al cargar el curso';
        this.loading = false;
      }
    });
  }

  loadProfesores() {
    this.usuariosService.getAll('profesor').subscribe({
      next: (data) => {
        this.profesores = data;
      },
      error: (err) => {
        console.error('Error al cargar profesores:', err);
      }
    });
  }

  onSubmit() {
    if (this.cursoForm.invalid) {
      Object.keys(this.cursoForm.controls).forEach(key => {
        this.cursoForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const cursoData = this.cursoForm.value;

    const operation = this.isEditMode
      ? this.cursosService.update(this.cursoId!, cursoData)
      : this.cursosService.create(cursoData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/cursos']);
      },
      error: (err) => {
        this.error = err.friendlyMessage || 'Error al guardar el curso';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/cursos']);
  }

  get f() {
    return this.cursoForm.controls;
  }
}
