<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CursoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $authUser = Auth::guard('api')->user();
        $query = Curso::with('profesor');

        // Profesor solo ve sus propios cursos
        if ($authUser->role === 'profesor') {
            $query->where('profesor_id', $authUser->id);
        }
        // Estudiante ve todos los cursos (para inscribirse)
        // Admin ve todos los cursos

        // Paginación: 15 por página por defecto
        $perPage = $request->input('per_page', 15);
        
        if ($request->boolean('paginate', false)) {
            $cursos = $query->orderBy('nombre')->paginate($perPage);
        } else {
            $cursos = $query->orderBy('nombre')->get();
        }
        
        return response()->json($cursos);
    }

    /**
     * Store a newly created resource in storage.
     * Solo admin puede crear cursos
     */
    public function store(Request $request)
    {
        $user = Auth::guard('api')->user();
        
        // Solo admin puede crear cursos
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden crear cursos'], 403);
        }

        // Normalizar nombre: trim y title case
        $nombreNormalizado = $this->normalizarNombre($request->input('nombre', ''));
        $request->merge(['nombre' => $nombreNormalizado]);

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255|unique:cursos,nombre',
            'descripcion' => 'required|string',
            'duracion' => 'required|integer',
            'profesor_id' => 'required|exists:users,id',
        ], [
            'nombre.unique' => 'Ya existe un curso con este nombre.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $curso = Curso::create($request->all());
        $curso->load('profesor');

        return response()->json([
            'message' => 'Curso creado exitosamente',
            'curso' => $curso
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $curso = Curso::with(['profesor', 'estudiantes'])->findOrFail($id);
        return response()->json($curso);
    }

    /**
     * Update the specified resource in storage.
     * Solo admin puede editar cursos
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::guard('api')->user();
        
        // Solo admin puede editar cursos
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden editar cursos'], 403);
        }
        
        $curso = Curso::findOrFail($id);

        // Normalizar nombre si viene en el request
        if ($request->has('nombre')) {
            $nombreNormalizado = $this->normalizarNombre($request->input('nombre'));
            $request->merge(['nombre' => $nombreNormalizado]);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:255|unique:cursos,nombre,' . $id,
            'descripcion' => 'string',
            'duracion' => 'integer',
            'profesor_id' => 'exists:users,id',
        ], [
            'nombre.unique' => 'Ya existe un curso con este nombre.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $curso->update($request->all());
        $curso->load('profesor');

        return response()->json([
            'message' => 'Curso actualizado exitosamente',
            'curso' => $curso
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * Solo admin puede eliminar cursos
     */
    public function destroy(string $id)
    {
        $user = Auth::guard('api')->user();
        
        // Solo admin puede eliminar cursos
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden eliminar cursos'], 403);
        }

        $curso = Curso::findOrFail($id);
        $curso->delete();

        return response()->json([
            'message' => 'Curso eliminado exitosamente'
        ]);
    }

    /**
     * Inscribir estudiante en un curso
     */
    public function inscribir(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $curso = Curso::findOrFail($id);
        $curso->estudiantes()->attach($request->usuario_id, [
            'fecha_inscripcion' => now()
        ]);

        return response()->json([
            'message' => 'Estudiante inscrito exitosamente'
        ]);
    }

    /**
     * Normalizar nombre del curso: trim y title case
     */
    private function normalizarNombre(string $nombre): string
    {
        // Trim, convertir a minúsculas y luego capitalizar cada palabra
        $nombre = trim($nombre);
        $nombre = mb_convert_case(mb_strtolower($nombre), MB_CASE_TITLE, 'UTF-8');
        return $nombre;
    }
}
