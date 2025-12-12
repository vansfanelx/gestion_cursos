import { Routes } from '@angular/router';
import { ListaUsuarios } from './lista-usuarios/lista-usuarios';
import { FormUsuario } from './form-usuario/form-usuario';
import { DetalleUsuario } from './detalle-usuario/detalle-usuario';

export const UsuariosRoutingModule: Routes = [
  {
    path: '',
    component: ListaUsuarios
  },
  {
    path: 'nuevo',
    component: FormUsuario
  },
  {
    path: 'editar/:id',
    component: FormUsuario
  },
  {
    path: ':id',
    component: DetalleUsuario
  }
];
