import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PokemonService } from '../../../core/services/pokemon.service';
import { PokemonDetail } from '../../../models/pokemon.detail';
import { finalize, switchMap } from 'rxjs/operators';
import { ColorTypeDirective } from '../../../shared/directives/color-type.directive';
import { catchError, of } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-edit-pokemon',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCardModule,
    MatButtonModule, MatSelectModule, MatSnackBarModule, ColorTypeDirective, RouterModule, MatIcon, MatCheckboxModule
  ],
  templateUrl: './edit-pokemon.component.html',
  styleUrls: ['./edit-pokemon.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditPokemonComponent implements OnInit {
  pokemonForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  previewPokemon: PokemonDetail | null = null;
  originalPokemon: PokemonDetail | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private pokemonService: PokemonService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPokemon();
  }

  initForm(): void {
    this.pokemonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      height: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', [Validators.pattern('https?://.+')]],
      type: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      stats: this.fb.group({
        hp: [60, [Validators.required, Validators.min(1), Validators.max(255)]],
        attack: [60, [Validators.required, Validators.min(1), Validators.max(255)]],
        defense: [60, [Validators.required, Validators.min(1), Validators.max(255)]],
        specialAttack: [60, [Validators.required, Validators.min(1), Validators.max(255)]],
        specialDefense: [60, [Validators.required, Validators.min(1), Validators.max(255)]],
        speed: [60, [Validators.required, Validators.min(1), Validators.max(255)]]
      }),
      abilities: this.fb.array([this.createAbility()])
    });

    this.pokemonForm.valueChanges.subscribe(values => {
      this.updatePreview(values);
      this.cdr.markForCheck();
    });
  }

  createAbility() {
      return this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        isHidden: [false]
      });
    }

    get abilities() {
      return this.pokemonForm.get('abilities') as FormArray;
    }

    addAbility() {
      this.abilities.push(this.createAbility());
      this.cdr.markForCheck();
    }

    removeAbility(index: number) {
      if (this.abilities.length > 1) {
        this.abilities.removeAt(index);
        this.cdr.markForCheck();
      }
    }

  loadPokemon(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        console.log('Loading Pokemon with ID:', id);
        return this.pokemonService.getPokemonDetail(Number(id)).pipe(
          catchError(error => {
            console.error('Error in loadPokemon:', error);
            this.errorMessage = error.message || 'Pokemon yüklenirken hata oluştu';
            return of(null);
          })
        );
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe(
      pokemon => {
        if (pokemon) {
          console.log('Pokemon loaded successfully:', pokemon);
          this.originalPokemon = pokemon;
          this.populateForm(pokemon);
          this.errorMessage = null;
        } else if (!this.errorMessage) {
          this.errorMessage = 'Pokemon bulunamadı';
          setTimeout(() => {
            this.router.navigate(['/pokemon']);
          }, 3000);
        }
        this.cdr.markForCheck();
      }
    );
  }

  populateForm(pokemon: PokemonDetail): void {
    if (!pokemon) {
      console.error('Cannot populate form: Pokemon is null or undefined');
      return;
    }

    try {
      console.log('Populating form with Pokemon:', pokemon);

      const imageUrl = pokemon.sprites?.front_default || '';
      let typeValue = '';

      if (pokemon.types && pokemon.types.length > 0 && pokemon.types[0].type) {
        typeValue = pokemon.types[0].type.name || '';
      }

      this.pokemonForm.patchValue({
        name: pokemon.name || '',
        height: pokemon.height || 0,
        weight: pokemon.weight || 0,
        imageUrl: imageUrl,
        type: typeValue,
        description: '',
        stats: {
          hp: pokemon.stats?.find(stat => stat.stat.name === 'hp')?.base_stat || 60,
          attack: pokemon.stats?.find(stat => stat.stat.name === 'attack')?.base_stat || 60,
          defense: pokemon.stats?.find(stat => stat.stat.name === 'defense')?.base_stat || 60,
          specialAttack: pokemon.stats?.find(stat => stat.stat.name === 'special-attack')?.base_stat || 60,
          specialDefense: pokemon.stats?.find(stat => stat.stat.name === 'special-defense')?.base_stat || 60,
          speed: pokemon.stats?.find(stat => stat.stat.name === 'speed')?.base_stat || 60
        },
      });

  const abilitiesFormArray = this.pokemonForm.get('abilities') as FormArray;
  while (abilitiesFormArray.length) {
  abilitiesFormArray.removeAt(0);
}

if (pokemon.abilities && pokemon.abilities.length > 0) {
  pokemon.abilities.forEach(ability => {
    console.log('Adding ability:', ability);
    console.log('Ability name:', ability.ability?.name);
    console.log('Is hidden:', ability.is_hidden);

    abilitiesFormArray.push(this.fb.group({
      name: ability.ability?.name || 'custom',
      isHidden: ability.is_hidden || false
    }));
  });
} else {
  abilitiesFormArray.push(this.createAbility());
}

      console.log('Form populated successfully');
    } catch (error) {
      console.error('Error populating form:', error);
      this.snackBar.open('Pokemon bilgileri formda gösterilemedi', 'Tamam', {
        duration: 3000
      });
    }
  }

  updatePreview(values: any): void {
    if (!values.name) {
      this.previewPokemon = null;
      return;
    }

    try {
      this.previewPokemon = new PokemonDetail();
      this.previewPokemon.id = this.originalPokemon?.id || -1;
      this.previewPokemon.name = values.name;
      this.previewPokemon.height = values.height || 0;
      this.previewPokemon.weight = values.weight || 0;

      this.previewPokemon.sprites = {
        front_default: values.imageUrl || '',
        other: undefined
      };

      if (values.type) {
        this.previewPokemon.types = [{
          slot: 1,
          type: {
            name: values.type
          }
        }];
      } else {
        this.previewPokemon.types = [];
      }

      if (values.stats) {
        this.previewPokemon.stats = [
          { base_stat: values.stats.hp, stat: { name: 'hp' } },
          { base_stat: values.stats.attack, stat: { name: 'attack' } },
          { base_stat: values.stats.defense, stat: { name: 'defense' } },
          { base_stat: values.stats.specialAttack, stat: { name: 'special-attack' } },
          { base_stat: values.stats.specialDefense, stat: { name: 'special-defense' } },
          { base_stat: values.stats.speed, stat: { name: 'speed' } }
        ];
      }

      if (values.abilities && values.abilities.length > 0) {
        console.log('Edit Component Abilities:', values.abilities);
        this.previewPokemon.abilities = values.abilities.map((ability: any, index: number) => {
          console.log('Single Ability:', ability);
          return {
            ability: {
              name: ability.name  || 'custom',
            },
            is_hidden: ability.isHidden
          };
        });
      }
    } catch (error) {
      console.error('Error updating preview:', error);
      this.previewPokemon = null;
    }
  }

  onSubmit(): void {
    if (this.pokemonForm.invalid) {
      this.snackBar.open('Lütfen form hatalarını düzeltin', 'Tamam', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const formValues = this.pokemonForm.value;

    const updatedPokemon = this.originalPokemon ? { ...this.originalPokemon } : new PokemonDetail();
    updatedPokemon.name = formValues.name;
    updatedPokemon.height = formValues.height || 0;
    updatedPokemon.weight = formValues.weight || 0;

    updatedPokemon.sprites = {
      ...updatedPokemon.sprites,
      front_default: formValues.imageUrl
    };

    updatedPokemon.types = [{
      slot: 1,
      type: {
        name: formValues.type
      }
    }];
    updatedPokemon.stats = [
      { base_stat: formValues.stats.hp, stat: { name: 'hp' } },
      { base_stat: formValues.stats.attack, stat: { name: 'attack' } },
      { base_stat: formValues.stats.defense, stat: { name: 'defense' } },
      { base_stat: formValues.stats.specialAttack, stat: { name: 'special-attack' } },
      { base_stat: formValues.stats.specialDefense, stat: { name: 'special-defense' } },
      { base_stat: formValues.stats.speed, stat: { name: 'speed' } }
    ];

    updatedPokemon.abilities = formValues.abilities.map((ability: any) => ({
      ability: {
        name: ability.name
      },
      is_hidden: ability.isHidden
    }));


    console.log('Submitting updated Pokemon:', updatedPokemon);

    this.pokemonService.updateCustomPokemon(updatedPokemon)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(
        result => {
          console.log('Update successful:', result);
          this.snackBar.open('Pokemon başarıyla güncellendi!', 'Tamam', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/pokemon', updatedPokemon.name]);
        },
        error => {
          console.error('Update error:', error);
          this.snackBar.open(`Pokemon güncellenirken bir hata oluştu: ${error.message}`, 'Tamam', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      );
  }

  goBack(): void {
    if (this.originalPokemon?.id) {
      this.router.navigate(['/pokemon', this.originalPokemon.name]);
    } else {
      this.router.navigate(['/pokemon']);
    }
  }

  resetForm(): void {
    if (this.originalPokemon) {
      this.populateForm(this.originalPokemon);
    } else {
      this.pokemonForm.reset();
    }
    this.cdr.markForCheck();
  }
}
