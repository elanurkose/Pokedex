import { Routes } from '@angular/router';
import { PokemonListComponent } from './pokemon-list/pokemon-list.component';
import { PokemonDetailComponent } from './pokemon-detail/pokemon-detail.component';
import { AddPokemonComponent } from './add-pokemon/add-pokemon.component';
import { EditPokemonComponent } from './edit-pokemon/edit-pokemon.component';

export const POKEMON_ROUTES: Routes = [
  { path: '', component: PokemonListComponent },
  { path: 'add', component: AddPokemonComponent },
  { path: 'edit/:id', component: EditPokemonComponent },
  { path: ':id', component: PokemonDetailComponent },
];
