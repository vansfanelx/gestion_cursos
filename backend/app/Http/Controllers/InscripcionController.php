<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InscripcionController extends Controller
{
    /**
     * Listar inscripciones según rol del usuario autenticado
     */
    public function index()
    {
        $user = Auth::guard('api')->user();
        
        if ($user->role === 'estudiante') {
            $inscripciones = Inscripcion::with(['curso', 'curso.profesor'])
                ->where('estudiante_id', $user->id)
                ->get();
        } else if ($user->role === 'profesor') {
            // Profesores ven inscripciones de sus cursos
            $inscripciones = Inscripcion::with(['curso', 'curso.profesor', 'estudiante'])
                ->whereHas('curso', function($q) use ($user) {
                    $q->where('profesor_id', $user->id);
                })
                ->get();
        } else {
            // Admin ve todas las inscripciones
            $inscripciones = Inscripcion::with(['curso', 'estudiante', 'curso.profesor'])->get();
        }

        return response()->json($inscripciones);
    }

    /**
     * Solicitar inscripción en un curso (estado pendiente) o crear inscripción directa (admin)
     */
    public function store(Request $request)
    {
        $user = Auth::guard('api')->user();

        // Admin puede crear inscripciones para cualquier estudiante
        if ($user->role === 'admin') {
            $request->validate([
                'curso_id' => 'required|exists:cursos,id',
                'estudiante_id' => 'required|exists:users,id'
            ]);

            $estudianteId = $request->estudiante_id;
            
            // Verificar si ya existe inscripción
            $existe = Inscripcion::where('estudiante_id', $estudianteId)
                ->where('curso_id', $request->curso_id)
                ->exists();

            if ($existe) {
                return response()->json(['message' => 'El estudiante ya tiene una inscripción en este curso'], 409);
            }

            $inscripcion = Inscripcion::create([
                'estudiante_id' => $estudianteId,
                'curso_id' => $request->curso_id,
                'estado' => 'inscrito', // Admin crea directamente como inscrito
                'fecha_inscripcion' => now()
            ]);

            $inscripcion->load(['curso', 'curso.profesor', 'estudiante']);

            return response()->json([
                'message' => 'Inscripción creada exitosamente',
                'inscripcion' => $inscripcion
            ], 201);
        }

        // Estudiante solo puede inscribirse a sí mismo
        if ($user->role !== 'estudiante') {
            return response()->json(['message' => 'Solo los estudiantes pueden solicitar inscripción'], 403);
        }

        $request->validate([
            'curso_id' => 'required|exists:cursos,id'
        ]);

        // Verificar si ya tiene solicitud o está inscrito
        $existe = Inscripcion::where('estudiante_id', $user->id)
            ->where('curso_id', $request->curso_id)
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya tienes una solicitud o inscripción en este curso'], 409);
        }

        $inscripcion = Inscripcion::create([
            'estudiante_id' => $user->id,
            'curso_id' => $request->curso_id,
            'estado' => 'pendiente',
            'fecha_solicitud' => now()
        ]);

        $inscripcion->load(['curso', 'curso.profesor']);

        return response()->json([
            'message' => 'Solicitud de inscripción enviada. Espera la aprobación del administrador.',
            'inscripcion' => $inscripcion
        ], 201);
    }

    /**
     * Ver detalle de una inscripción
     */
    public function show($id)
    {
        $user = Auth::guard('api')->user();
        $inscripcion = Inscripcion::with(['curso', 'estudiante', 'curso.profesor'])->findOrFail($id);

        // Verificar permisos
        if ($user->role === 'estudiante' && $inscripcion->estudiante_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->role === 'profesor' && $inscripcion->curso->profesor_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($inscripcion);
    }

    /**
     * Actualizar estado/nota de inscripción (profesor/admin)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        $inscripcion = Inscripcion::with('curso')->findOrFail($id);

        // Solo profesor del curso o admin pueden actualizar
        if ($user->role === 'estudiante') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->role === 'profesor' && $inscripcion->curso->profesor_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'estado' => 'sometimes|in:abandonado', // Solo abandonado es manual
            'nota_parcial' => 'nullable|numeric|min:0|max:20',
            'nota_final' => 'nullable|numeric|min:0|max:20'
        ]);

        // Si el usuario marca abandonado, es prioridad
        if ($request->input('estado') === 'abandonado') {
            $validated['estado'] = 'abandonado';
            $inscripcion->update($validated);
            return response()->json($inscripcion->fresh());
        }

        // Calcular notas con valores actualizados o existentes
        $parcial = $request->has('nota_parcial') ? $request->input('nota_parcial') : $inscripcion->nota_parcial;
        $final = $request->has('nota_final') ? $request->input('nota_final') : $inscripcion->nota_final;
        
        // Convertir a float o null
        $p = ($parcial !== null && $parcial !== '') ? (float)$parcial : null;
        $f = ($final !== null && $final !== '') ? (float)$final : null;

        // Determinar estado automático basado en notas
        if ($p !== null && $f !== null) {
            // Ambas notas → completado
            $validated['promedio'] = round($p * 0.4 + $f * 0.6, 2);
            $validated['estado'] = 'completado';
            $validated['fecha_finalizacion'] = $inscripcion->fecha_finalizacion ?? now();
        } elseif ($p !== null || $f !== null) {
            // Al menos una nota → en_progreso
            $validated['estado'] = 'en_progreso';
            $validated['promedio'] = null; // Promedio incompleto
            $validated['fecha_finalizacion'] = null;
        } else {
            // Sin notas → inscrito
            $validated['estado'] = 'inscrito';
            $validated['promedio'] = null;
            $validated['fecha_finalizacion'] = null;
        }

        $inscripcion->update($validated);
        
        return response()->json($inscripcion);
    }

    /**
     * Cancelar inscripción (estudiante puede cancelar solicitud pendiente o inscrito, admin puede eliminar)
     */
    public function destroy($id)
    {
        $user = Auth::guard('api')->user();
        $inscripcion = Inscripcion::findOrFail($id);

        if ($user->role === 'estudiante') {
            if ($inscripcion->estudiante_id !== $user->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            // Estudiantes solo pueden cancelar si están en estado 'inscrito' o 'pendiente'
            if (!in_array($inscripcion->estado, ['inscrito', 'pendiente'])) {
                return response()->json(['message' => 'No puedes cancelar un curso en progreso o finalizado'], 400);
            }
        }

        if ($user->role === 'profesor') {
            return response()->json(['message' => 'Los profesores no pueden eliminar inscripciones'], 403);
        }

        $inscripcion->delete();

        return response()->json(['message' => 'Inscripción cancelada exitosamente']);
    }

    /**
     * Listar cursos disponibles para inscripción
     */
    public function cursosDisponibles()
    {
        $user = Auth::guard('api')->user();

        if ($user->role !== 'estudiante') {
            return response()->json(['message' => 'Solo estudiantes pueden ver cursos disponibles'], 403);
        }

        // Cursos en los que NO está inscrito ni tiene solicitud pendiente
        $cursosConSolicitud = Inscripcion::where('estudiante_id', $user->id)
            ->pluck('curso_id')
            ->toArray();
            
        $cursosDisponibles = Curso::with('profesor')
            ->whereNotIn('id', $cursosConSolicitud)
            ->get();

        return response()->json($cursosDisponibles);
    }

    /**
     * Listar solicitudes pendientes (solo admin)
     */
    public function solicitudesPendientes()
    {
        $user = Auth::guard('api')->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $solicitudes = Inscripcion::with(['curso', 'estudiante', 'curso.profesor'])
            ->where('estado', 'pendiente')
            ->orderBy('fecha_solicitud', 'desc')
            ->get();

        return response()->json($solicitudes);
    }

    /**
     * Aprobar solicitud de inscripción (solo admin)
     */
    public function aprobar($id)
    {
        $user = Auth::guard('api')->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $inscripcion = Inscripcion::findOrFail($id);

        if ($inscripcion->estado !== 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }

        $inscripcion->update([
            'estado' => 'inscrito',
            'fecha_inscripcion' => now()
        ]);

        $inscripcion->load(['curso', 'estudiante']);

        return response()->json([
            'message' => 'Solicitud aprobada. El estudiante ha sido inscrito.',
            'inscripcion' => $inscripcion
        ]);
    }

    /**
     * Rechazar solicitud de inscripción (solo admin)
     */
    public function rechazar(Request $request, $id)
    {
        $user = Auth::guard('api')->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $inscripcion = Inscripcion::findOrFail($id);

        if ($inscripcion->estado !== 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }

        $inscripcion->update([
            'estado' => 'rechazado',
            'motivo_rechazo' => $request->input('motivo', 'Solicitud rechazada por el administrador')
        ]);

        return response()->json([
            'message' => 'Solicitud rechazada.',
            'inscripcion' => $inscripcion
        ]);
    }
}
