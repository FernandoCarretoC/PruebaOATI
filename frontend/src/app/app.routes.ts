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
];
