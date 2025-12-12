import { Routes } from '@angular/router';
import { ListaInscripciones } from './lista-inscripciones/lista-inscripciones';
import { DetalleInscripcion } from './detalle-inscripcion/detalle-inscripcion';
import { FormInscripcion } from './form-inscripcion/form-inscripcion';

export const InscripcionesRoutingModule: Routes = [
  {
    path: '',
    component: ListaInscripciones
  },
  {
    path: 'nuevo',
    component: FormInscripcion
  },
  {
    path: 'editar/:id',
    component: FormInscripcion
  },
  {
    path: ':id',
    component: DetalleInscripcion
  }
];
