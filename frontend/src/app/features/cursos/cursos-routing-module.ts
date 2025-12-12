import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaCursos } from './lista-cursos/lista-cursos';
import { FormCurso } from './form-curso/form-curso';
import { DetalleCurso } from './detalle-curso/detalle-curso';

const routes: Routes = [
  {
    path: '',
    component: ListaCursos
  },
  {
    path: 'nuevo',
    component: FormCurso
  },
  {
    path: 'editar/:id',
    component: FormCurso
  },
  {
    path: ':id',
    component: DetalleCurso
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CursosRoutingModule { }
