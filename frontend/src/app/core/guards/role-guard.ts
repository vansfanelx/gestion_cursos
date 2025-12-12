import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  // Obtener los roles permitidos de la ruta
  const allowedRoles = route.data['roles'] as string[];
  
  if (authService.isAuthenticated() && authService.hasRole(allowedRoles)) {
    return true;
  }
  
  // Redirigir al dashboard si no tiene permisos
  router.navigate(['/dashboard']);
  return false;
};

