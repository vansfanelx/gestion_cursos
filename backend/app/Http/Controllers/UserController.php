<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $authUser = Auth::guard('api')->user();
        $query = User::query();

        // Profesor solo ve estudiantes inscritos en sus cursos
        if ($authUser->role === 'profesor') {
            $estudiantesIds = Inscripcion::whereHas('curso', function($q) use ($authUser) {
                $q->where('profesor_id', $authUser->id);
            })->pluck('estudiante_id')->unique()->toArray();
            
            $query->whereIn('id', $estudiantesIds);
        }

        // Filtro por rol (solo admin puede ver todos los roles)
        if ($request->has('role') && $authUser->role === 'admin') {
            $query->where('role', $request->role);
        } elseif ($authUser->role === 'profesor') {
            // Profesor solo ve estudiantes
            $query->where('role', 'estudiante');
        }

        // Paginación: 15 por página por defecto
        $perPage = $request->input('per_page', 15);
        
        if ($request->boolean('paginate', false)) {
            $users = $query->orderBy('name')->paginate($perPage);
        } else {
            $users = $query->orderBy('name')->get();
        }
        
        return response()->json($users);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with(['courses', 'enrolledCourses'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Store a newly created resource in storage.
     * Solo admin puede crear usuarios
     */
    public function store(Request $request)
    {
        $authUser = Auth::guard('api')->user();
        
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden crear usuarios'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,profesor,estudiante',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     * Solo admin puede actualizar usuarios
     */
    public function update(Request $request, string $id)
    {
        $authUser = Auth::guard('api')->user();
        
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden editar usuarios'], 403);
        }
        
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $id,
            'password' => 'string|min:6',
            'role' => 'in:admin,profesor,estudiante',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['name', 'email', 'role']);
        
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'user' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * Solo admin puede eliminar usuarios
     */
    public function destroy(string $id)
    {
        $authUser = Auth::guard('api')->user();
        
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Solo los administradores pueden eliminar usuarios'], 403);
        }
        
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }
}
