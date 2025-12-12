<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CursoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cursos = Curso::with('profesor')->get();
        return response()->json($cursos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'duracion' => 'required|integer',
            'profesor_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
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
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:255',
            'descripcion' => 'string',
            'duracion' => 'integer',
            'profesor_id' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $curso = Curso::findOrFail($id);
        $curso->update($request->all());
        $curso->load('profesor');

        return response()->json([
            'message' => 'Curso actualizado exitosamente',
            'curso' => $curso
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
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
}
