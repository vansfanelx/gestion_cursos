<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Rutas de autenticación
Route::group([
    'prefix' => 'auth'
], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);
});

// Rutas de usuarios (protegidas)
Route::middleware('auth:api')->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::put('users/{id}', [UserController::class, 'update']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);
});

// Rutas de cursos (protegidas)
Route::middleware('auth:api')->group(function () {
    Route::get('cursos', [CursoController::class, 'index']);
    Route::post('cursos', [CursoController::class, 'store']);
    Route::get('cursos/{id}', [CursoController::class, 'show']);
    Route::put('cursos/{id}', [CursoController::class, 'update']);
    Route::delete('cursos/{id}', [CursoController::class, 'destroy']);
    Route::post('cursos/{id}/inscribir', [CursoController::class, 'inscribir']);
});

// Rutas de inscripciones (protegidas)
Route::middleware('auth:api')->group(function () {
    Route::get('inscripciones', [InscripcionController::class, 'index']);
    Route::post('inscripciones', [InscripcionController::class, 'store']);
    Route::get('inscripciones/{id}', [InscripcionController::class, 'show']);
    Route::put('inscripciones/{id}', [InscripcionController::class, 'update']);
    Route::delete('inscripciones/{id}', [InscripcionController::class, 'destroy']);
    Route::get('cursos-disponibles', [InscripcionController::class, 'cursosDisponibles']);
    
    // Rutas de gestión de solicitudes (admin)
    Route::get('solicitudes-pendientes', [InscripcionController::class, 'solicitudesPendientes']);
    Route::post('inscripciones/{id}/aprobar', [InscripcionController::class, 'aprobar']);
    Route::post('inscripciones/{id}/rechazar', [InscripcionController::class, 'rechazar']);
});
