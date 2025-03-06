import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'pokemon', pathMatch: 'full' },
  {
    path: 'pokemon',
    loadChildren: () => import('./features/pokemon/pokemon.routes').then(m => m.POKEMON_ROUTES)
  },
];
