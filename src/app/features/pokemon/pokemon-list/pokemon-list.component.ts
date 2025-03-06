import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonService } from '../../../core/services/pokemon.service';
import { PokemonDetail } from '../../../models/pokemon.detail';
import { PokemonSearchComponent } from "../pokemon-search/pokemon-search.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ColorTypeDirective } from '../../../shared/directives/color-type.directive';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [PokemonSearchComponent, MatCardModule, MatProgressSpinnerModule, CommonModule, ColorTypeDirective, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent implements OnInit {
  public offset = 0;
  private limit = 20;
  loading = false;
  error = '';
  pokemons: PokemonDetail[] = [];
  filteredPokemons: PokemonDetail[] = [];

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMore();
  }

  showDetails(pokemon: PokemonDetail) {
    this.router.navigate(['/pokemon', pokemon.id]);
  }

  onSearch(name: string) {
    if (name && name.length >= 2) {
      this.filteredPokemons = this.pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().startsWith(name.toLowerCase())
      );
    } else {
      this.filteredPokemons = [...this.pokemons];
    }
    this.cdr.markForCheck();
  }

  loadMore() {
    if (!this.loading) {
      this.loading = true;
      this.error = '';
      this.cdr.markForCheck();

      this.pokemonService.getPokemonList(this.offset, this.limit).subscribe({
        next: (newPokemons) => {
          this.pokemons = [...this.pokemons, ...newPokemons];
          this.filteredPokemons = this.pokemons;
          this.offset += this.limit; 
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = `Pokémon verileri yüklenirken bir hata oluştu: ${err.message}`;
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
