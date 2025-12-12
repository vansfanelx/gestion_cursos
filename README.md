# Sistema de Gestión de Cursos

**Autor:** Jonathan Jiménez Rojas  
**GitHub:** [https://github.com/vansfanelx](https://github.com/vansfanelx)

## Descripción del Proyecto

Sistema web SPA (Single Page Application) desarrollado con **Laravel 12** como backend API REST con autenticación JWT y **Angular** como frontend, que permite gestionar cursos y usuarios de una institución educativa.

## Tecnologías Utilizadas

### Backend
- **Laravel 12** - Framework PHP
- **JWT (tymon/jwt-auth)** - Autenticación mediante tokens
- **MySQL** - Base de datos
- **PHP 8.3+**

### Frontend
- **Angular** (última versión) - Framework de desarrollo
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **HttpClient** - Consumo de API REST

## Características Implementadas

### Backend (Laravel)
✅ Autenticación JWT con tokens seguros  
✅ API REST para gestión de usuarios, cursos e inscripciones  
✅ Middleware de autenticación y autorización  
✅ CORS configurado para Angular  
✅ Migraciones de base de datos  
✅ Modelos con relaciones Eloquent  
✅ Validación de datos  
✅ Control de roles (Admin, Profesor, Estudiante)

### Frontend (Angular)
✅ Arquitectura modular con separación de responsabilidades  
✅ Lazy Loading por módulos funcionales  
✅ Guards de autenticación (AuthGuard) y roles (RoleGuard)  
✅ HttpInterceptor para inyectar JWT automáticamente  
✅ Servicios REST con HttpClient  
✅ Programación orientada a objetos con componentes y modelos  
✅ Pipes personalizados  
✅ Directivas personalizadas  
✅ Rutas protegidas según tipo de usuario  
✅ Gestión de estado con Observables  
✅ Interfaz clara y fluida (SPA)

## Estructura del Proyecto

```
gestion_cursos/
├── backend/                 # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── CursoController.php
│   │   │   │   └── UserController.php
│   │   └── Models/
│   │       ├── User.php
│   │       └── Curso.php
│   ├── config/
│   │   ├── auth.php
│   │   ├── jwt.php
│   │   └── cors.php
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
│
└── frontend/                # Angular SPA
    ├── src/
    │   ├── app/
    │   │   ├── auth/                    # Módulo de autenticación
    │   │   │   └── login/
    │   │   ├── core/                    # Módulo Core
    │   │   │   ├── guards/
    │   │   │   │   ├── auth-guard.ts
    │   │   │   │   └── role-guard.ts
    │   │   │   ├── interceptors/
    │   │   │   │   └── jwt-interceptor.ts
    │   │   │   ├── models/
    │   │   │   │   ├── user.model.ts
    │   │   │   │   └── curso.model.ts
    │   │   │   └── services/
    │   │   │       ├── auth.ts
    │   │   │       ├── cursos.ts
    │   │   │       └── usuarios.ts
    │   │   ├── features/                # Módulos funcionales
    │   │   │   ├── dashboard/
    │   │   │   ├── cursos/
    │   │   │   └── usuarios/
    │   │   └── shared/                  # Módulo compartido
    │   └── environments/
    └── angular.json
```

## Instalación y Configuración

### Prerrequisitos
- PHP 8.3+
- Composer
- Node.js 18+
- npm
- MySQL
- Laragon (recomendado para Windows)

### Instalación del Backend (Laravel)

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias de Composer:
```bash
composer install
```

3. Copiar el archivo de configuración:
```bash
copy .env.example .env
```

4. Configurar la base de datos y URLs en el archivo `.env`:
```env
# URLs del proyecto
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_cursos
DB_USERNAME=root
DB_PASSWORD=
```

5. Generar la clave de la aplicación:
```bash
php artisan key:generate
```

6. Generar la clave secreta JWT:
```bash
php artisan jwt:secret
```

7. Ejecutar las migraciones:
```bash
php artisan migrate
```

8. (Opcional) Poblar la base de datos con datos de prueba:
```bash
php artisan db:seed
```
Esto creará usuarios y cursos de ejemplo:
- Admin: admin@test.com / 123456
- Profesor: profesor@test.com / 123456
- Estudiante: estudiante@test.com / 123456

9. Iniciar el servidor de desarrollo:
```bash
php artisan serve
```

El backend estará disponible en: `http://localhost:8000`

### Instalación del Frontend (Angular)

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias de npm:
```bash
npm install
```

3. Verificar la configuración de la API en `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

4. Iniciar el servidor de desarrollo:
```bash
ng serve
```

El frontend estará disponible en: `http://localhost:4200`

## Configuración CORS

El proyecto está configurado para que el backend (Laravel) permita peticiones desde el frontend (Angular) mediante CORS.

**Variables de entorno en `.env` del backend:**
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200
```

**Configuración en `config/cors.php`:**
- `allowed_origins`: Lee la variable `FRONTEND_URL` del `.env`
- `supports_credentials`: true (permite cookies y autenticación)
- `allowed_methods`: ['*'] (todos los métodos HTTP)
- `allowed_headers`: ['*'] (todos los headers)

**Para producción:**
1. Actualiza `FRONTEND_URL` con tu dominio real
2. Actualiza `APP_URL` con tu dominio de backend
3. Considera usar dominios específicos en lugar de `['*']`

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario autenticado

### Usuarios (Requiere autenticación)
- `GET /api/users` - Listar usuarios
- `GET /api/users/{id}` - Ver detalles de usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Cursos (Requiere autenticación)
- `GET /api/cursos` - Listar cursos
- `POST /api/cursos` - Crear curso
- `GET /api/cursos/{id}` - Ver detalles de curso
- `PUT /api/cursos/{id}` - Actualizar curso
- `DELETE /api/cursos/{id}` - Eliminar curso
- `POST /api/cursos/{id}/inscribir` - Inscribir estudiante

## Roles y Permisos

### Admin
- Acceso completo al sistema
- Gestión de usuarios
- Gestión de cursos
- Asignación de roles

### Profesor
- Gestión de sus cursos
- Ver estudiantes inscritos
- Actualizar información de cursos

### Estudiante
- Ver cursos disponibles
- Inscribirse a cursos
- Ver sus cursos inscritos

## Conceptos Aplicados

### Programación Orientada a Objetos
- **Modelos**: User, Curso con propiedades y métodos
- **Controladores**: AuthController, CursoController, UserController
- **Servicios**: Auth, Cursos, Usuarios con encapsulamiento
- **Pipes**: Transformación de datos
- **Directivas**: Componentes reutilizables

### Arquitectura Modular
- **Módulo Core**: Servicios singleton, guards, interceptores
- **Módulo Shared**: Componentes compartidos
- **Módulos Feature**: Dashboard, Cursos, Usuarios con lazy loading
- **Módulo Auth**: Autenticación independiente

### Guards y Enrutamiento
- **AuthGuard**: Protege rutas que requieren autenticación
- **RoleGuard**: Controla acceso según rol de usuario
- **Rutas públicas**: Login, registro
- **Rutas protegidas**: Dashboard, gestión de cursos y usuarios

### HttpInterceptor
- Inyecta automáticamente el token JWT en cada petición
- Centraliza la lógica de autenticación
- Manejo de errores HTTP

### Lazy Loading
- Carga diferida de módulos por rutas
- Mejora el rendimiento inicial
- Reduce el bundle size

## Desarrollo Técnico

### Presentación Técnica

**Documento PDF incluye:**
1. Explicación de rutas y guards implementados
2. Integración de servicios REST
3. Enlace al repositorio GitHub
4. Instrucciones de instalación y ejecución

### Criterios de Evaluación Cumplidos

#### Programación Orientada a Objetos (4 puntos)
✅ Arquitectura escalable y fácil de mantener  
✅ Separación clara entre componentes, servicios y modelos  
✅ Pipes y directivas personalizados

#### Enrutamiento Dividido (4 puntos)
✅ Lazy loading implementado  
✅ Rutas protegidas y públicas  
✅ Navegación múltiple inexistente (SPA)

#### Guards Múltiples (4 puntos)
✅ AuthGuard para autenticación  
✅ RoleGuard para control de acceso  
✅ Gestión denegada según rol de usuario

#### Integración con API REST (4 puntos)
✅ HttpClient integrado  
✅ Peticiones GET, POST, PUT, DELETE  
✅ Separación adecuada de errores  
✅ Manejo centralizado con Observables

#### HttpInterceptor (4 puntos)
✅ Token insertado automáticamente  
✅ Validación y manejo de errores  
✅ Gestión global de flujo de datos

## Pruebas

### Crear Usuario Administrador (vía API)
```bash
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```

### Login
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "123456"
}
```

## Problemas Conocidos y Soluciones

1. **Error CORS**: Verificar que `config/cors.php` permite el origen de Angular
2. **JWT Token inválido**: Regenerar secret con `php artisan jwt:secret`
3. **Error de migraciones**: Verificar conexión a base de datos en `.env`

## Contacto

**Jonathan Jiménez Rojas**  
GitHub: [https://github.com/vansfanelx](https://github.com/vansfanelx)

---

Fecha de desarrollo: Diciembre 2025
