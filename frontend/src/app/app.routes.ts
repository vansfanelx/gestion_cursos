import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { MainLayout } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing-module').then(m => m.AuthRoutingModule)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard-routing-module').then(m => m.DashboardRoutingModule)
      },
      {
        path: 'cursos',
        loadChildren: () => import('./features/cursos/cursos-routing-module').then(m => m.CursosRoutingModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios-routing-module').then(m => m.UsuariosRoutingModule),
        canActivate: [roleGuard],
        data: { roles: ['profesor', 'admin'] }
      },
      {
        path: 'inscripciones',
        loadChildren: () => import('./features/inscripciones/inscripciones-routing-module').then(m => m.InscripcionesRoutingModule),
        canActivate: [roleGuard],
        data: { roles: ['profesor', 'admin'] }
      },
      {
        path: 'cursos-disponibles',
        loadComponent: () => import('./features/inscripciones/cursos-disponibles/cursos-disponibles').then(m => m.CursosDisponibles),
        canActivate: [roleGuard],
        data: { roles: ['estudiante'] }
      },
      {
        path: 'mis-cursos',
        redirectTo: 'cursos-disponibles'
      },
      {
        path: 'mis-cursos-profesor',
        redirectTo: 'cursos'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

