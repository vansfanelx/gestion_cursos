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
            $inscripciones = Inscripcion::with(['curso', 'estudiante'])
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
     * Inscribir estudiante en un curso
     */
    public function store(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id'
        ]);

        $user = Auth::guard('api')->user();

        if ($user->role !== 'estudiante') {
            return response()->json(['message' => 'Solo los estudiantes pueden inscribirse'], 403);
        }

        // Verificar si ya está inscrito
        $existe = Inscripcion::where('estudiante_id', $user->id)
            ->where('curso_id', $request->curso_id)
            ->exists();

        if ($existe) {
            return response()->json(['message' => 'Ya estás inscrito en este curso'], 409);
        }

        $inscripcion = Inscripcion::create([
            'estudiante_id' => $user->id,
            'curso_id' => $request->curso_id,
            'estado' => 'inscrito',
            'fecha_inscripcion' => now()
        ]);

        $inscripcion->load(['curso', 'curso.profesor']);

        return response()->json($inscripcion, 201);
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
            'estado' => 'sometimes|in:inscrito,en_progreso,completado,abandonado',
            'nota_final' => 'nullable|numeric|min:0|max:20'
        ]);

        // Si se actualiza la nota final, marcar como completado automáticamente
        if ($request->has('nota_final') && $request->nota_final !== null) {
            $validated['estado'] = 'completado';
            $validated['fecha_finalizacion'] = now();
        }

        $inscripcion->update($validated);

        // Si el estado cambia a completado, registrar fecha de finalización
        if (isset($validated['estado']) && $validated['estado'] === 'completado' && !$inscripcion->fecha_finalizacion) {
            $inscripcion->fecha_finalizacion = now();
            $inscripcion->save();
        }
        
        return response()->json($inscripcion);
    }

    /**
     * Cancelar inscripción (estudiante puede cancelar, admin puede eliminar)
     */
    public function destroy($id)
    {
        $user = Auth::guard('api')->user();
        $inscripcion = Inscripcion::findOrFail($id);

        if ($user->role === 'estudiante') {
            if ($inscripcion->estudiante_id !== $user->id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            // Estudiantes solo pueden cancelar si están en estado 'inscrito'
            if ($inscripcion->estado !== 'inscrito') {
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

        // Cursos en los que NO está inscrito
        $cursosInscritos = Inscripcion::where('estudiante_id', $user->id)
            ->pluck('curso_id')
            ->toArray();
            
        $cursosDisponibles = Curso::with('profesor')
            ->whereNotIn('id', $cursosInscritos)
            ->get();

        return response()->json($cursosDisponibles);
    }
}
