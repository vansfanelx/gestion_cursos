import { Routes } from '@angular/router';
import { ListaInscripciones } from './lista-inscripciones/lista-inscripciones';
import { DetalleInscripcion } from './detalle-inscripcion/detalle-inscripcion';
import { FormInscripcion } from './form-inscripcion/form-inscripcion';
import { SolicitudesPendientes } from './solicitudes-pendientes/solicitudes-pendientes';

export const InscripcionesRoutingModule: Routes = [
  {
    path: '',
    component: ListaInscripciones
  },
  {
    path: 'solicitudes',
    component: SolicitudesPendientes
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
