<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'duracion',
        'profesor_id',
    ];

    /**
     * Get the profesor that owns the curso.
     */
    public function profesor()
    {
        return $this->belongsTo(User::class, 'profesor_id');
    }

    /**
     * Inscripciones del curso
     */
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    /**
     * The students that belong to the curso.
     */
    public function estudiantes()
    {
        return $this->belongsToMany(User::class, 'inscripciones', 'curso_id', 'estudiante_id')
                    ->withPivot('estado', 'nota_final', 'fecha_inscripcion', 'fecha_finalizacion')
                    ->withTimestamps();
    }
}
