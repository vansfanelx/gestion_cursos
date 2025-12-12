# 🌐 Configuración de URLs y CORS

## Arquitectura de URLs

### Desarrollo Local

```
┌─────────────────────────────────────────────┐
│  Frontend (Angular)                         │
│  URL: http://localhost:4200                 │
│  Puerto: 4200                               │
└────────────┬────────────────────────────────┘
             │
             │ HTTP Requests
             │ (con JWT en headers)
             ▼
┌─────────────────────────────────────────────┐
│  Backend (Laravel)                          │
│  URL: http://localhost:8000                 │
│  API: http://localhost:8000/api             │
│  Puerto: 8000                               │
└─────────────────────────────────────────────┘
```

### Producción (Ejemplo)

```
┌─────────────────────────────────────────────┐
│  Frontend (Angular)                         │
│  URL: https://cursos.ejemplo.com            │
│  o    https://app.ejemplo.com               │
└────────────┬────────────────────────────────┘
             │
             │ HTTPS Requests
             │ (con JWT en headers)
             ▼
┌─────────────────────────────────────────────┐
│  Backend (Laravel)                          │
│  URL: https://api.ejemplo.com               │
│  API: https://api.ejemplo.com/api           │
└─────────────────────────────────────────────┘
```

## Configuración CORS

### ¿Qué es CORS?

CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad que permite que un servidor indique qué orígenes (dominios) tienen permiso para acceder a sus recursos.

### Configuración en Laravel

#### 1. Variables de entorno (.env)

```env
# URL del backend
APP_URL=http://localhost:8000

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:4200
```

**Producción:**
```env
APP_URL=https://api.ejemplo.com
FRONTEND_URL=https://cursos.ejemplo.com
```

#### 2. Archivo de configuración (config/cors.php)

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    // Lee el dominio del frontend desde .env
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:4200'),
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    // Permite credenciales (cookies, headers de autorización)
    'supports_credentials' => true,
];
```

#### 3. Middleware en bootstrap/app.php

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
    ]);
})
```

### Configuración en Angular

#### 1. Environment (src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**Producción (environment.prod.ts):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.ejemplo.com/api'
};
```

#### 2. Interceptor JWT (core/interceptors/jwt-interceptor.ts)

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

## Headers HTTP

### Request desde Angular al Backend

```http
GET http://localhost:8000/api/cursos HTTP/1.1
Host: localhost:8000
Origin: http://localhost:4200
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json
Accept: application/json
```

### Response desde Backend a Angular

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "data": [...]
}
```

## Verificación de CORS

### 1. Verificar configuración en .env

```bash
# En el directorio backend
cat .env | grep -E "(APP_URL|FRONTEND_URL)"
```

Debe mostrar:
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200
```

### 2. Probar desde el navegador

Abrir consola del navegador (F12) y ejecutar:

```javascript
fetch('http://localhost:8000/api/cursos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error CORS:', error));
```

### 3. Revisar errores CORS

Si ves este error:
```
Access to fetch at 'http://localhost:8000/api/cursos' from origin 
'http://localhost:4200' has been blocked by CORS policy
```

**Soluciones:**
1. Verificar que `FRONTEND_URL` esté correctamente configurado en `.env`
2. Reiniciar el servidor de Laravel: `php artisan serve`
3. Limpiar caché de configuración: `php artisan config:clear`
4. Verificar que HandleCors esté en el middleware

## Múltiples Dominios (Producción)

Si necesitas permitir múltiples dominios:

```php
// config/cors.php
'allowed_origins' => explode(',', env('FRONTEND_URLS', 'http://localhost:4200')),
```

```env
# .env
FRONTEND_URLS=https://app.ejemplo.com,https://admin.ejemplo.com,https://cursos.ejemplo.com
```

## Seguridad

### Desarrollo
✅ Permite `http://localhost:4200`  
✅ Permite credenciales (JWT)  
✅ Permite todos los métodos HTTP

### Producción
✅ Especifica dominios exactos (no usar `*`)  
✅ Usa HTTPS  
✅ Limita métodos si es posible  
✅ Configura `max_age` para cachear preflight  
⚠️ Nunca expongas información sensible en headers

## Comandos Útiles

```bash
# Limpiar caché de configuración
php artisan config:clear

# Verificar configuración actual
php artisan config:show cors

# Ver rutas API
php artisan route:list --path=api

# Reiniciar servidor
php artisan serve --host=localhost --port=8000
```

---

**Autor:** Jonathan Jiménez Rojas  
**GitHub:** https://github.com/vansfanelx
