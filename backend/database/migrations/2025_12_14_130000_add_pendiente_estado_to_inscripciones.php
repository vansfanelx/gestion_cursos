<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modificar el enum para incluir 'pendiente' y 'rechazado'
        DB::statement("ALTER TABLE inscripciones MODIFY COLUMN estado ENUM('pendiente', 'inscrito', 'en_progreso', 'completado', 'abandonado', 'rechazado') DEFAULT 'pendiente'");
        
        // Agregar columna para motivo de rechazo (opcional)
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->text('motivo_rechazo')->nullable()->after('fecha_finalizacion');
            $table->timestamp('fecha_solicitud')->nullable()->after('motivo_rechazo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropColumn(['motivo_rechazo', 'fecha_solicitud']);
        });
        
        DB::statement("ALTER TABLE inscripciones MODIFY COLUMN estado ENUM('inscrito', 'en_progreso', 'completado', 'abandonado') DEFAULT 'inscrito'");
    }
};
