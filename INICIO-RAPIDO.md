# 🚀 Inicio Rápido

## Backend (Laravel)

```bash
# Navegar al directorio
cd backend

# Instalar dependencias
composer install

# Configurar entorno
copy .env.example .env

# Configurar base de datos y URLs en .env:
# APP_URL=http://localhost:8000
# FRONTEND_URL=http://localhost:4200
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=gestion_cursos
# DB_USERNAME=root
# DB_PASSWORD=

# Generar claves
php artisan key:generate
php artisan jwt:secret

# Crear base de datos (si no existe)
# En MySQL: CREATE DATABASE gestion_cursos;

# Migrar y poblar
php artisan migrate
php artisan db:seed

# Iniciar servidor
php artisan serve
```

Backend: http://localhost:8000

---

## Frontend (Angular)

```bash
# Navegar al directorio
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor
ng serve
```

Frontend: http://localhost:4200

---

## 🔑 Usuarios de Prueba

Después de ejecutar `php artisan db:seed`:

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@test.com | 123456 |
| Profesor | profesor@test.com | 123456 |
| Estudiante | estudiante@test.com | 123456 |

---

## 📡 API Endpoints

**Base URL:** http://localhost:8000/api

### Autenticación (Públicas)
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Autenticación (Protegidas - requiere token)
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token
- `GET /auth/me` - Usuario actual

### Cursos (Protegidas)
- `GET /cursos` - Listar cursos
- `POST /cursos` - Crear curso
- `GET /cursos/{id}` - Ver curso
- `PUT /cursos/{id}` - Actualizar curso
- `DELETE /cursos/{id}` - Eliminar curso
- `POST /cursos/{id}/inscribir` - Inscribir estudiante

### Usuarios (Protegidas - Admin)
- `GET /users` - Listar usuarios
- `GET /users/{id}` - Ver usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

---

## 🧪 Probar API con cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"123456\"}"
```

### Obtener cursos (requiere token)
```bash
curl -X GET http://localhost:8000/api/cursos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## ✅ Verificación

1. ✅ Backend corriendo en http://localhost:8000
2. ✅ Frontend corriendo en http://localhost:4200
3. ✅ Base de datos creada y migrada
4. ✅ Puedes hacer login con los usuarios de prueba

---

## 🔧 Troubleshooting

**Error: Database not found**
- Crear base de datos: `CREATE DATABASE gestion_cursos;`

**Error: JWT secret not set**
- Ejecutar: `php artisan jwt:secret`

**Error: Node modules**
- Ejecutar: `npm install` en el directorio frontend

**Error: CORS**
- Verificar que `FRONTEND_URL` esté configurado en `.env` del backend
- Por defecto: `FRONTEND_URL=http://localhost:4200`
- Verificar que el backend esté en `http://localhost:8000`
- Reiniciar el servidor de Laravel después de cambiar `.env`

**Error: Cannot connect to API**
- Verificar que el backend esté corriendo en puerto 8000
- Verificar que `apiUrl` en `environment.ts` apunte a `http://localhost:8000/api`
- Abrir consola del navegador (F12) para ver errores CORS

---

## 🌐 Configuración de URLs

### Backend (Laravel)
- **URL Base**: `http://localhost:8000`
- **API Base**: `http://localhost:8000/api`
- **Configuración**: `APP_URL` y `FRONTEND_URL` en `.env`

### Frontend (Angular)
- **URL Base**: `http://localhost:4200`
- **API URL**: Configurada en `src/environments/environment.ts`
- **CORS**: Permitido desde el backend vía `FRONTEND_URL`

---

**Autor:** Jonathan Jiménez Rojas  
**GitHub:** https://github.com/vansfanelx
