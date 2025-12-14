import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../../core/services/usuarios';
import { Auth } from '../../../core/services/auth';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

interface Usuario {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModal],
  templateUrl: './lista-usuarios.html',
  styleUrl: './lista-usuarios.css',
})
export class ListaUsuarios implements OnInit {
  usuarios: Usuario[] = [];
  loading = true;
  error = '';
  filtroRole = 'todos';
  searchText = '';
  
  // Modal de confirmación
  showDeleteModal = false;
  userToDelete: { id: number; name: string } | null = null;

  constructor(
    private usuariosService: Usuarios,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  get isProfesor(): boolean {
    return this.authService.getUserRole() === 'profesor';
  }

  get pageTitle(): string {
    return this.isProfesor ? '🎓 Mis Estudiantes' : '👥 Gestión de Usuarios';
  }

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    console.log('Token en localStorage:', token ? 'Sí existe' : 'No existe');
    if (!token) {
      this.error = 'No hay token de autenticación. Por favor, inicia sesión.';
      this.loading = false;
      return;
    }
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.loading = true;
    this.error = '';
    console.log('Iniciando carga de usuarios...');
    this.usuariosService.getAll().subscribe({
      next: (data: Usuario[]) => {
        console.log('Usuarios cargados:', data);
        this.usuarios = data;
        this.loading = false;
        console.log('Loading después de cargar:', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error completo:', err);
        if (err.status === 401) {
          this.error = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = `Error al cargar los usuarios: ${err.message || 'Error desconocido'}`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    let filtered = this.usuarios;
    
    // Filtrar por rol
    if (this.filtroRole !== 'todos') {
      filtered = filtered.filter(u => u.role === this.filtroRole);
    }
    
    // Filtrar por búsqueda de texto
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.role.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }

  getRoleClass(role: string): string {
    return role;
  }

  getRoleLabel(role: string): string {
    const labels: {[key: string]: string} = {
      'admin': 'ADMIN',
      'profesor': 'PROFESOR',
      'estudiante': 'ESTUDIANTE'
    };
    return labels[role] || role.toUpperCase();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/usuarios', id]);
  }

  editUsuario(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  deleteUsuario(id: number, name: string): void {
    this.userToDelete = { id, name };
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.usuariosService.delete(this.userToDelete.id).subscribe({
        next: () => {
          console.log('Usuario eliminado exitosamente');
          this.showDeleteModal = false;
          this.userToDelete = null;
          this.loadUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.error = 'Error al eliminar el usuario. Inténtalo de nuevo.';
          this.showDeleteModal = false;
          this.userToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }
}
