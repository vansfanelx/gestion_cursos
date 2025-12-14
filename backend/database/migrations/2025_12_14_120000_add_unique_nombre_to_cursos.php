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
        // Primero normalizar nombres existentes para evitar conflictos
        DB::statement("UPDATE cursos SET nombre = TRIM(nombre)");
        
        // Agregar índice único case-insensitive (MySQL usa collation utf8_general_ci por defecto)
        Schema::table('cursos', function (Blueprint $table) {
            $table->unique('nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cursos', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });
    }
};
