import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Auth } from '../../../core/services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  subItems?: { label: string; route: string; roles?: string[] }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  isExpanded$;
  isMobileOpen$;
  
  openSubmenu: string | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard'
    },
    {
      label: 'Cursos',
      icon: '📚',
      subItems: [
        { label: 'Ver Cursos', route: '/cursos' },
        { label: 'Nuevo Curso', route: '/cursos/nuevo', roles: ['profesor', 'admin'] }
      ]
    },
    {
      label: 'Inscripciones',
      icon: '✍️',
      subItems: [
        { label: 'Ver Inscripciones', route: '/inscripciones', roles: ['admin'] },
        { label: 'Nueva Inscripción', route: '/inscripciones/nuevo', roles: ['admin'] }
      ],
      roles: ['admin']
    },
    {
      label: 'Usuarios',
      icon: '👥',
      subItems: [
        { label: 'Ver Usuarios', route: '/usuarios', roles: ['profesor', 'admin'] },
        { label: 'Nuevo Usuario', route: '/usuarios/nuevo', roles: ['admin'] }
      ],
      roles: ['profesor', 'admin']
    }
  ];

  constructor(
    public sidebarService: SidebarService,
    private authService: Auth,
    private router: Router
  ) {
    this.isExpanded$ = this.sidebarService.isExpanded$;
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.subItems) {
      this.openSubmenu = this.openSubmenu === item.label ? null : item.label;
    }
  }

  isSubmenuOpen(item: MenuItem): boolean {
    return this.openSubmenu === item.label;
  }

  canAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRole = this.authService.getUserRole();
    return roles.includes(userRole);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    if (window.innerWidth < 1024) {
      this.sidebarService.closeMobile();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get userRole(): string {
    return this.authService.getUserRole();
  }

  get userInitial(): string {
    const name = this.currentUser?.name || 'U';
    return name.charAt(0).toUpperCase();
  }
}
