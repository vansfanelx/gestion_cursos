import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Usuarios } from '../../../core/services/usuarios';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './form-usuario.html',
  styleUrl: './form-usuario.css',
})
export class FormUsuario implements OnInit {
  usuarioForm: FormGroup;
  isEditMode = false;
  usuarioId?: number;
  loading = false;
  error = '';

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'estudiante', label: 'Estudiante' }
  ];

  constructor(
    private fb: FormBuilder,
    private usuariosService: Usuarios,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['estudiante', Validators.required]
    });
  }

  ngOnInit() {
    this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.usuarioId && !isNaN(this.usuarioId);
    
    // En modo edición, el password es opcional
    if (this.isEditMode) {
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
      this.loadUsuario();
    }
  }

  loadUsuario() {
    this.loading = true;
    this.usuariosService.getById(this.usuarioId!).subscribe({
      next: (data) => {
        this.usuarioForm.patchValue({
          name: data.name,
          email: data.email,
          role: data.role
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Error al cargar el usuario';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.usuarioForm.invalid) {
      Object.keys(this.usuarioForm.controls).forEach(key => {
        this.usuarioForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const usuarioData = this.usuarioForm.value;

    // Si estamos editando y no se cambió la contraseña, no la enviamos
    if (this.isEditMode && !usuarioData.password) {
      delete usuarioData.password;
    }

    const operation = this.isEditMode
      ? this.usuariosService.update(this.usuarioId!, usuarioData)
      : this.usuariosService.create(usuarioData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/usuarios']);
      },
      error: (err: any) => {
        this.error = 'Error al guardar el usuario';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/usuarios']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    }
    return '';
  }
}
