import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'series', pathMatch: 'full' },
  {
    path: 'series',
    loadComponent: () =>
      import('./features/series/series-list/series-list.component').then(
        (m) => m.SeriesListComponent
      ),
  },
  {
    path: 'series/new',
    loadComponent: () =>
      import('./features/series/series-form/series-form.component').then(
        (m) => m.SeriesFormComponent
      ),
  },
  {
    path: 'series/:id/edit',
    loadComponent: () =>
      import('./features/series/series-form/series-form.component').then(
        (m) => m.SeriesFormComponent
      ),
  },
  {
    path: 'directores',
    loadComponent: () =>
      import('./features/directores/directores-list/directores-list.component').then(
        (m) => m.DirectoresListComponent
      ),
  },
  {
    path: 'directores/new',
    loadComponent: () =>
      import('./features/directores/directores-form/directores-form.component').then(
        (m) => m.DirectoresFormComponent
      ),
  },
  {
    path: 'directores/:id/edit',
    loadComponent: () =>
      import('./features/directores/directores-form/directores-form.component').then(
        (m) => m.DirectoresFormComponent
      ),
  },
];
