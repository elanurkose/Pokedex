import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../../../core/services/pokemon.service';
import { switchMap } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ColorTypeDirective } from '../../../shared/directives/color-type.directive';
import { StatNamePipe } from "../../../shared/pipes/stat-name.pipe";

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatSpinner, CommonModule, ColorTypeDirective, StatNamePipe],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css']
})
export class PokemonDetailComponent implements OnInit {
  pokemon: any;
  loading = true;
  isCustomPokemon = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => this.pokemonService.getPokemonDetail(params['id']))
    ).subscribe(
      pokemon => {
        this.pokemon = pokemon;
        this.loading = false;
        this.isCustomPokemon = pokemon.id >= 9000;
        this.cdr.markForCheck();
      },
      error => {
        console.error('Error loading pokemon details:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    );
  }

  goBack() {
    this.router.navigate(['/pokemon']);
  }

  editPokemon() {
    this.router.navigate(['/pokemon/edit', this.pokemon.id]);
  }

  deletePokemon() {
    if (confirm('Bu Pokemon\'u silmek istediğinizden emin misiniz?')) {
      this.pokemonService.deleteCustomPokemon(this.pokemon.id);
      this.router.navigate(['/pokemon']);
    }
  }
}
