import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('access_token');
  
  // Si existe un token, clonar la petición y agregar el header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Manejar errores globalmente
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del servidor
        switch (error.status) {
          case 401:
            // Token expirado o no válido
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            localStorage.removeItem('access_token');
            localStorage.removeItem('currentUser');
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para acceder a este recurso.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 422:
            // Errores de validación
            const validationErrors = error.error.errors;
            if (validationErrors) {
              errorMessage = Object.values(validationErrors).flat().join(', ');
            } else {
              errorMessage = error.error.message || 'Datos inválidos.';
            }
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
            break;
          default:
            errorMessage = error.error.message || `Error ${error.status}: ${error.statusText}`;
        }
      }
      
      console.error('Error HTTP:', errorMessage, error);
      return throwError(() => ({ ...error, friendlyMessage: errorMessage }));
    })
  );
};

