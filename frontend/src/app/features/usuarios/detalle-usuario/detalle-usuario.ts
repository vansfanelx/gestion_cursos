import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Usuarios } from '../../../core/services/usuarios';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-usuario.html',
  styleUrl: './detalle-usuario.css'
})
export class DetalleUsuario implements OnInit {
  usuario: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: Usuarios,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadUsuario(Number(id));
  }

  loadUsuario(id: number): void {
    this.loading = true;
    this.usuariosService.getById(id).subscribe({
      next: (data) => {
        this.usuario = data;
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar el usuario';
        this.loading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        console.error('Error:', err);
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: {[key: string]: string} = {
      'admin': 'Administrador',
      'profesor': 'Profesor',
      'estudiante': 'Estudiante'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    return role;
  }

  volver(): void {
    this.router.navigate(['/usuarios']);
  }
}
