<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Curso;
use App\Models\Inscripcion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuarios de ejemplo
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@test.com',
            'password' => Hash::make('123456'),
            'role' => 'admin',
        ]);

        $profesor1 = User::create([
            'name' => 'Juan Pérez',
            'email' => 'profesor@test.com',
            'password' => Hash::make('123456'),
            'role' => 'profesor',
        ]);

        $profesor2 = User::create([
            'name' => 'María García',
            'email' => 'maria@test.com',
            'password' => Hash::make('123456'),
            'role' => 'profesor',
        ]);

        $estudiante1 = User::create([
            'name' => 'Carlos López',
            'email' => 'estudiante@test.com',
            'password' => Hash::make('123456'),
            'role' => 'estudiante',
        ]);

        $estudiante2 = User::create([
            'name' => 'Ana Torres',
            'email' => 'ana@test.com',
            'password' => Hash::make('123456'),
            'role' => 'estudiante',
        ]);

        // Crear cursos de ejemplo
        $curso1 = Curso::create([
            'nombre' => 'Desarrollo Web con Angular',
            'descripcion' => 'Aprende a desarrollar aplicaciones web modernas con Angular, TypeScript y las mejores prácticas.',
            'duracion' => 40,
            'profesor_id' => $profesor1->id,
        ]);

        $curso2 = Curso::create([
            'nombre' => 'Laravel API REST',
            'descripcion' => 'Construcción de APIs RESTful con Laravel, autenticación JWT y mejores prácticas.',
            'duracion' => 35,
            'profesor_id' => $profesor1->id,
        ]);

        $curso3 = Curso::create([
            'nombre' => 'Base de Datos MySQL',
            'descripcion' => 'Fundamentos de bases de datos relacionales, diseño de esquemas y consultas avanzadas.',
            'duracion' => 30,
            'profesor_id' => $profesor2->id,
        ]);

        $curso4 = Curso::create([
            'nombre' => 'Git y GitHub',
            'descripcion' => 'Control de versiones con Git y colaboración en equipo usando GitHub.',
            'duracion' => 20,
            'profesor_id' => $profesor2->id,
        ]);

        // Inscribir estudiantes a cursos
        Inscripcion::create([
            'estudiante_id' => $estudiante1->id,
            'curso_id' => $curso1->id,
            'estado' => 'en_progreso',
            'fecha_inscripcion' => now()->subDays(15),
        ]);

        Inscripcion::create([
            'estudiante_id' => $estudiante2->id,
            'curso_id' => $curso1->id,
            'estado' => 'en_progreso',
            'fecha_inscripcion' => now()->subDays(12),
        ]);

        Inscripcion::create([
            'estudiante_id' => $estudiante1->id,
            'curso_id' => $curso2->id,
            'estado' => 'completado',
            'nota_final' => 18.5,
            'fecha_inscripcion' => now()->subDays(60),
            'fecha_finalizacion' => now()->subDays(5),
        ]);

        Inscripcion::create([
            'estudiante_id' => $estudiante2->id,
            'curso_id' => $curso3->id,
            'estado' => 'inscrito',
            'fecha_inscripcion' => now()->subDays(3),
        ]);

        Inscripcion::create([
            'estudiante_id' => $estudiante1->id,
            'curso_id' => $curso4->id,
            'estado' => 'inscrito',
            'fecha_inscripcion' => now()->subDays(1),
        ]);

        $this->command->info('✅ Base de datos poblada exitosamente!');
        $this->command->info('');
        $this->command->info('Usuarios creados:');
        $this->command->info('Admin: admin@test.com / 123456');
        $this->command->info('Profesor: profesor@test.com / 123456');
        $this->command->info('Estudiante: estudiante@test.com / 123456');
    }
}

