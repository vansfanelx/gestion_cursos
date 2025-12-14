# 🎓 Sistema de Gestión de Cursos

**Autor:** Jimenez Rojas, Jonathan Jose
           Revilla Huapaya, Javier Alberto
           Talledo Ceverino, Andy Steve
**GitHub:** [https://github.com/vansfanelx](https://github.com/vansfanelx)  
**Curso:** Desarrollo de Interfaces  
**Fecha:** Diciembre 2025

---

## 📋 Descripción del Proyecto

Sistema web SPA (Single Page Application) profesional tipo **EVA (Entorno Virtual de Aprendizaje)** desarrollado con **Laravel 12** como backend API REST con autenticación JWT y **Angular 21** como frontend. Permite gestionar cursos, usuarios e inscripciones de una institución educativa con sistema de calificaciones profesional.

### Características Principales
- 🔐 **Autenticación JWT** con tokens seguros
- 👥 **Sistema de roles** (Admin, Profesor, Estudiante)
- 📚 **Gestión de cursos** con asignación de profesores
- 📝 **Sistema de inscripciones** con flujo de aprobación
- 📊 **Sistema de calificaciones** (Parcial 40% + Final 60% = Promedio)
- 🛡️ **Guards de navegación** para rutas protegidas
- 🔄 **Interceptores HTTP** para manejo automático de tokens

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Laravel | 12.x | Framework PHP para API REST |
| PHP | 8.3+ | Lenguaje de programación |
| MySQL | 8.0+ | Base de datos relacional |
| tymon/jwt-auth | 2.x | Autenticación JWT |

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Angular | 21.x | Framework SPA |
| TypeScript | 5.x | Lenguaje tipado |
| RxJS | 7.x | Programación reactiva |
| Angular Router | 21.x | Enrutamiento SPA |

---

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto

```
gestion_cursos/
├── backend/                          # Laravel 12 API REST
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php      # Autenticación JWT
│   │   │   │   ├── CursoController.php     # CRUD de cursos
│   │   │   │   ├── InscripcionController.php # Gestión de inscripciones
│   │   │   │   └── UserController.php      # CRUD de usuarios
│   │   │   └── Middleware/
│   │   └── Models/
│   │       ├── User.php                    # Modelo de usuario
│   │       ├── Curso.php                   # Modelo de curso
│   │       └── Inscripcion.php             # Modelo de inscripción
│   ├── config/
│   │   ├── auth.php                        # Configuración de guards
│   │   ├── jwt.php                         # Configuración JWT
│   │   └── cors.php                        # Configuración CORS
│   ├── database/
│   │   └── migrations/                     # Migraciones de BD
│   └── routes/
│       └── api.php                         # Rutas de la API
│
└── frontend/                         # Angular 21 SPA
    ├── src/
    │   ├── app/
    │   │   ├── auth/                       # Módulo de autenticación
    │   │   │   └── login/
    │   │   ├── core/                       # Módulo Core (Singleton)
    │   │   │   ├── guards/
    │   │   │   │   ├── auth-guard.ts       # Guard de autenticación
    │   │   │   │   └── role-guard.ts       # Guard de roles
    │   │   │   ├── interceptors/
    │   │   │   │   └── jwt-interceptor.ts  # Interceptor JWT
    │   │   │   └── services/
    │   │   │       ├── auth.ts             # Servicio de autenticación
    │   │   │       ├── cursos.ts           # Servicio de cursos
    │   │   │       ├── inscripciones.ts    # Servicio de inscripciones
    │   │   │       └── usuarios.ts         # Servicio de usuarios
    │   │   ├── features/                   # Módulos funcionales (Lazy Loading)
    │   │   │   ├── dashboard/
    │   │   │   ├── cursos/
    │   │   │   ├── inscripciones/
    │   │   │   └── usuarios/
    │   │   └── shared/                     # Componentes compartidos
    │   │       ├── components/
    │   │       │   ├── sidebar/
    │   │       │   ├── header/
    │   │       │   ├── confirm-modal/
    │   │       │   └── search-select/
    │   │       └── pipes/
    │   └── environments/
    └── angular.json
```

---

## 🔐 Sistema de Autenticación JWT

### Flujo de Autenticación

```
┌─────────────┐     POST /api/auth/login      ┌─────────────┐
│   Angular   │ ──────────────────────────────▶│   Laravel   │
│  Frontend   │                                │   Backend   │
└─────────────┘                                └─────────────┘
       │                                              │
       │         { email, password }                  │
       │ ◀────────────────────────────────────────────│
       │                                              │
       │         JWT Token + User Data                │
       │ ◀────────────────────────────────────────────│
       │                                              │
       │  localStorage.setItem('access_token', jwt)   │
       ▼                                              ▼
┌─────────────┐     Authorization: Bearer JWT  ┌─────────────┐
│  Peticiones │ ──────────────────────────────▶│  API REST   │
│ Protegidas  │                                │  Protegida  │
└─────────────┘                                └─────────────┘
```

### Configuración JWT en Laravel

**config/auth.php:**
```php
'defaults' => [
    'guard' => 'api',
    'passwords' => 'users',
],

'guards' => [
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

### Interceptor JWT en Angular

El interceptor `jwt-interceptor.ts` inyecta automáticamente el token en cada petición:

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  
  // Inyectar token en el header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo centralizado de errores
      if (error.status === 401) {
        localStorage.removeItem('access_token');
        router.navigate(['/auth/login']);
      }
      return throwError(() => ({ ...error, friendlyMessage: errorMessage }));
    })
  );
};
```

---

## 🛡️ Guards de Navegación

### AuthGuard (Protección de Rutas Autenticadas)

Verifica si el usuario tiene un token JWT válido:

```typescript
// core/guards/auth-guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;  // ✅ Permite acceso
  }
  
  // ❌ Redirige al login
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
```

### RoleGuard (Control de Acceso por Rol)

Verifica si el usuario tiene el rol requerido:

```typescript
// core/guards/role-guard.ts
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  
  // Obtener roles permitidos de la configuración de ruta
  const allowedRoles = route.data['roles'] as string[];
  
  if (authService.isAuthenticated() && authService.hasRole(allowedRoles)) {
    return true;  // ✅ Permite acceso
  }
  
  // ❌ Redirige al dashboard
  router.navigate(['/dashboard']);
  return false;
};
```

---

## 🗺️ Configuración de Rutas

### Rutas Principales (app.routes.ts)

```typescript
export const routes: Routes = [
  // Ruta pública - Autenticación
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing-module')
      .then(m => m.AuthRoutingModule)
  },
  
  // Rutas protegidas - Requieren autenticación
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],  // 🛡️ Guard de autenticación
    children: [
      // Dashboard - Acceso para todos los usuarios autenticados
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard-routing-module')
          .then(m => m.DashboardRoutingModule)
      },
      
      // Cursos - Acceso para todos los usuarios autenticados
      {
        path: 'cursos',
        loadChildren: () => import('./features/cursos/cursos-routing-module')
          .then(m => m.CursosRoutingModule)
      },
      
      // Usuarios - Solo Admin y Profesor
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios-routing-module')
          .then(m => m.UsuariosRoutingModule),
        canActivate: [roleGuard],  // 🛡️ Guard de roles
        data: { roles: ['profesor', 'admin'] }
      },
      
      // Inscripciones - Solo Admin y Profesor
      {
        path: 'inscripciones',
        loadChildren: () => import('./features/inscripciones/inscripciones-routing-module')
          .then(m => m.InscripcionesRoutingModule),
        canActivate: [roleGuard],
        data: { roles: ['profesor', 'admin'] }
      },
      
      // Cursos disponibles - Solo Estudiantes
      {
        path: 'cursos-disponibles',
        loadComponent: () => import('./features/inscripciones/cursos-disponibles/cursos-disponibles')
          .then(m => m.CursosDisponibles),
        canActivate: [roleGuard],
        data: { roles: ['estudiante'] }
      }
    ]
  }
];
```

### Matriz de Acceso por Rol

| Ruta | Admin | Profesor | Estudiante |
|------|:-----:|:--------:|:----------:|
| `/dashboard` | ✅ | ✅ | ✅ |
| `/cursos` | ✅ | ✅ (solo sus cursos) | ❌ |
| `/cursos/nuevo` | ✅ | ❌ | ❌ |
| `/usuarios` | ✅ | ✅ (solo estudiantes) | ❌ |
| `/inscripciones` | ✅ | ✅ (solo sus cursos) | ❌ |
| `/inscripciones/solicitudes` | ✅ | ❌ | ❌ |
| `/cursos-disponibles` | ❌ | ❌ | ✅ |

---

## 🌐 Servicios REST Integrados

### Endpoints de la API

#### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| POST | `/auth/register` | Registrar usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión | ❌ |
| POST | `/auth/logout` | Cerrar sesión | ✅ |
| POST | `/auth/refresh` | Refrescar token | ✅ |
| GET | `/auth/me` | Obtener usuario actual | ✅ |

#### Usuarios (`/api/users`)
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Listar usuarios | Admin, Profesor |
| POST | `/users` | Crear usuario | Admin |
| GET | `/users/{id}` | Ver usuario | Admin, Profesor |
| PUT | `/users/{id}` | Actualizar usuario | Admin |
| DELETE | `/users/{id}` | Eliminar usuario | Admin |

#### Cursos (`/api/cursos`)
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/cursos` | Listar cursos | Todos |
| POST | `/cursos` | Crear curso | Admin |
| GET | `/cursos/{id}` | Ver curso | Todos |
| PUT | `/cursos/{id}` | Actualizar curso | Admin |
| DELETE | `/cursos/{id}` | Eliminar curso | Admin |

#### Inscripciones (`/api/inscripciones`)
| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/inscripciones` | Listar inscripciones | Admin, Profesor |
| POST | `/inscripciones` | Crear inscripción | Admin, Estudiante |
| GET | `/inscripciones/{id}` | Ver inscripción | Todos |
| PUT | `/inscripciones/{id}` | Actualizar notas | Admin, Profesor |
| DELETE | `/inscripciones/{id}` | Eliminar inscripción | Admin |
| GET | `/cursos-disponibles` | Cursos para inscribirse | Estudiante |
| GET | `/solicitudes-pendientes` | Solicitudes pendientes | Admin |
| POST | `/inscripciones/{id}/aprobar` | Aprobar solicitud | Admin |
| POST | `/inscripciones/{id}/rechazar` | Rechazar solicitud | Admin |

### Ejemplo de Servicio Angular

```typescript
// core/services/inscripciones.ts
@Injectable({ providedIn: 'root' })
export class Inscripciones {
  private apiUrl = `${environment.apiUrl}/inscripciones`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  create(data: { estudiante_id: number; curso_id: number }): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, data: Partial<Inscripcion>): Observable<Inscripcion> {
    return this.http.put<Inscripcion>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }
}
```

---

## 📊 Sistema de Calificaciones

### Fórmula de Promedio
```
Promedio = (Nota Parcial × 0.40) + (Nota Final × 0.60)
```

### Estados de Inscripción
| Estado | Descripción | Transiciones |
|--------|-------------|--------------|
| `pendiente` | Solicitud enviada | → inscrito, rechazado |
| `inscrito` | Aprobado por admin | → en_progreso |
| `en_progreso` | Con al menos una nota | → completado, abandonado |
| `completado` | Ambas notas registradas | - |
| `abandonado` | Marcado por admin | - |
| `rechazado` | Solicitud denegada | - |

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- PHP 8.3+
- Composer 2.x
- Node.js 18+
- npm 9+
- MySQL 8.0+
- Laragon (recomendado para Windows)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/vansfanelx/gestion-cursos.git
cd gestion-cursos
```

### 2. Configuración del Backend (Laravel)

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
composer install

# Copiar archivo de configuración
copy .env.example .env

# Configurar variables de entorno en .env
# DB_DATABASE=gestion_cursos
# DB_USERNAME=root
# DB_PASSWORD=

# Generar clave de aplicación
php artisan key:generate

# Generar clave JWT
php artisan jwt:secret

# Ejecutar migraciones
php artisan migrate

# (Opcional) Poblar con datos de prueba
php artisan db:seed

# Iniciar servidor
php artisan serve
```

**El backend estará en:** `http://localhost:8000`

### 3. Configuración del Frontend (Angular)

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

**El frontend estará en:** `http://localhost:4200`

### 4. Usuarios de Prueba (después de db:seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@test.com | 123456 |
| Profesor | profesor@test.com | 123456 |
| Estudiante | estudiante@test.com | 123456 |

---

## ✅ Pruebas Funcionales

### 1. Prueba de Autenticación

**Login exitoso:**
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

### 2. Prueba de Guards

| Escenario | Resultado Esperado |
|-----------|-------------------|
| Usuario no autenticado accede a `/dashboard` | Redirige a `/auth/login` |
| Estudiante accede a `/inscripciones` | Redirige a `/dashboard` |
| Profesor accede a `/cursos-disponibles` | Redirige a `/dashboard` |
| Admin accede a cualquier ruta | ✅ Acceso permitido |

### 3. Prueba de Permisos por Rol

**Admin:**
- ✅ Crear/Editar/Eliminar cursos
- ✅ Crear/Editar/Eliminar usuarios
- ✅ Aprobar/Rechazar solicitudes de inscripción
- ✅ Ver todas las inscripciones

**Profesor:**
- ❌ Crear/Eliminar cursos
- ✅ Ver sus cursos asignados
- ✅ Editar notas de sus estudiantes
- ✅ Ver inscripciones de sus cursos
- ❌ Editar usuarios

**Estudiante:**
- ✅ Ver cursos disponibles
- ✅ Solicitar inscripción
- ✅ Ver sus inscripciones y notas
- ❌ Acceder a gestión de usuarios/cursos

### 4. Prueba de CRUD de Inscripciones

```bash
# Crear inscripción (Admin)
POST http://localhost:8000/api/inscripciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "estudiante_id": 3,
  "curso_id": 1
}

# Actualizar notas (Profesor)
PUT http://localhost:8000/api/inscripciones/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "nota_parcial": 15.5,
  "nota_final": 17.0
}

# Respuesta esperada (promedio calculado automáticamente)
{
  "id": 1,
  "nota_parcial": 15.5,
  "nota_final": 17.0,
  "promedio": 16.4,
  "estado": "completado"
}
```

---

## 📝 Criterios de Evaluación Cumplidos

### Programación Orientada a Objetos 
✅ Arquitectura modular escalable  
✅ Separación de responsabilidades (Controllers, Services, Models)  
✅ Componentes reutilizables (SearchSelect, ConfirmModal)  
✅ Pipes personalizados (FilterPipe, SearchFilterPipe)

### Enrutamiento Dividido 
✅ Lazy Loading por módulos funcionales  
✅ Rutas protegidas y públicas  
✅ Navegación SPA sin recargas

### Guards Múltiples 
✅ AuthGuard para rutas autenticadas  
✅ RoleGuard para control por rol  
✅ Redirecciones apropiadas según permisos

### Integración con API REST 
✅ HttpClient con Observables  
✅ Operaciones CRUD completas  
✅ Manejo de errores centralizado  
✅ Servicios independientes por entidad

### HttpInterceptor 
✅ Inyección automática de JWT  
✅ Manejo global de errores HTTP  
✅ Redirección automática en token expirado

---

## 🔧 Solución de Problemas

| Problema | Solución |
|----------|----------|
| Error CORS | Verificar `FRONTEND_URL` en `.env` del backend |
| JWT inválido | Ejecutar `php artisan jwt:secret` |
| Error de migraciones | Verificar conexión a BD en `.env` |
| Loading infinito | Verificar que el backend esté corriendo |
| 401 Unauthorized | Token expirado, volver a iniciar sesión |

---

## 📞 Contacto

**Jonathan José Jiménez Rojas**  
📧 Email: jonathan.jimenez@example.com  
🐙 GitHub: [https://github.com/vansfanelx](https://github.com/vansfanelx)

---

## 📄 Licencia

Este proyecto es de uso académico para el curso de Desarrollo de Interfaces - IDAT 2025.

---

*Última actualización: Diciembre 2025*
