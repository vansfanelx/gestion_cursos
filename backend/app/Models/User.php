<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role
        ];
    }

    /**
     * Get the courses for the user.
     */
    public function courses()
    {
        return $this->hasMany(Curso::class, 'profesor_id');
    }

    /**
     * Inscripciones del estudiante
     */
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'estudiante_id');
    }

    /**
     * The courses that belong to the user (as student).
     */
    public function enrolledCourses()
    {
        return $this->belongsToMany(Curso::class, 'inscripciones', 'estudiante_id', 'curso_id')
                    ->withPivot('estado', 'nota_final', 'fecha_inscripcion', 'fecha_finalizacion')
                    ->withTimestamps();
    }
}
