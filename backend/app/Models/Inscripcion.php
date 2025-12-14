<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';
    
    protected $fillable = [
        'estudiante_id',
        'curso_id',
        'estado',
        'nota_parcial',
        'nota_final',
        'promedio',
        'fecha_inscripcion',
        'fecha_finalizacion',
        'fecha_solicitud',
        'motivo_rechazo'
    ];

    protected $casts = [
        'nota_parcial' => 'decimal:2',
        'nota_final' => 'decimal:2',
        'promedio' => 'decimal:2',
        'fecha_inscripcion' => 'datetime',
        'fecha_finalizacion' => 'datetime',
        'fecha_solicitud' => 'datetime',
    ];

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estudiante_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }
}
