import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { POKEMON_ROUTES } from './app/features/pokemon/pokemon.routes';
import { PokemonService } from './app/core/services/pokemon.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      {
        path: '',
        redirectTo: 'pokemon',
        pathMatch: 'full'
      },
      {
        path: 'pokemon',
        children: POKEMON_ROUTES
      }
    ]),
    provideAnimations(),
    provideHttpClient(),
    PokemonService
  ]
}).catch(err => console.error(err));
