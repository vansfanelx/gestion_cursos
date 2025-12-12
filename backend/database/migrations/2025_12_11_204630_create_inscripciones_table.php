<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');
            $table->enum('estado', ['inscrito', 'en_progreso', 'completado', 'abandonado'])->default('inscrito');
            $table->decimal('nota_final', 5, 2)->nullable();
            $table->timestamp('fecha_inscripcion')->useCurrent();
            $table->timestamp('fecha_finalizacion')->nullable();
            $table->timestamps();
            
            // Evitar inscripciones duplicadas
            $table->unique(['estudiante_id', 'curso_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};
