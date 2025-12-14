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
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->decimal('nota_parcial', 5, 2)->nullable()->after('estado');
            $table->decimal('nota_final', 5, 2)->nullable()->change(); // ensure nullable if not already
            $table->decimal('promedio', 5, 2)->nullable()->after('nota_final');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropColumn(['nota_parcial', 'promedio']);
        });
    }
};
