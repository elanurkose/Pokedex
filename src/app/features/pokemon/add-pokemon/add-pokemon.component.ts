import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { PokemonService } from '../../../core/services/pokemon.service';
import { PokemonDetail } from '../../../models/pokemon.detail';
import { ColorTypeDirective } from '../../../shared/directives/color-type.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-add-pokemon',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatCardModule, MatButtonModule, MatSelectModule, MatSnackBarModule, ColorTypeDirective,
    MatIconModule, MatCheckboxModule
  ],
  templateUrl: './add-pokemon.component.html',
  styleUrl: './add-pokemon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPokemonComponent implements OnInit {
  pokemonForm!: FormGroup;
  isSubmitting = false;
  previewPokemon: PokemonDetail | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pokemonService: PokemonService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
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

  updatePreview(values: any): void {
    if (values.name) {
      this.previewPokemon = new PokemonDetail();
      this.previewPokemon.id = -1;
      this.previewPokemon.name = values.name;
      this.previewPokemon.height = values.height || 0;
      this.previewPokemon.weight = values.weight || 0;

      this.previewPokemon.sprites = {
        front_default: values.imageUrl,
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
        this.previewPokemon.abilities = values.abilities.map((ability: any, index: number) => ({
          ability: {
            name: ability.name || 'custom'
          },
          is_hidden: ability.isHidden || false
        }));
      } else {
        this.previewPokemon.abilities = [{
          ability: {
            name: 'custom'
          },
          is_hidden: false
        }];
      }
    } else {
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
    const newPokemon = new PokemonDetail();
    newPokemon.id = Math.floor(Math.random() * 10000) + 9000;
    newPokemon.name = formValues.name;
    newPokemon.height = formValues.height || 0;
    newPokemon.weight = formValues.weight || 0;

    newPokemon.sprites = {
      front_default: formValues.imageUrl,
      other: undefined
    };

    newPokemon.types = [{
      slot: 1,
      type: {
        name: formValues.type
      }
    }];

    newPokemon.stats = [
      { base_stat: formValues.stats.hp, stat: { name: 'hp' } },
      { base_stat: formValues.stats.attack, stat: { name: 'attack' } },
      { base_stat: formValues.stats.defense, stat: { name: 'defense' } },
      { base_stat: formValues.stats.specialAttack, stat: { name: 'special-attack' } },
      { base_stat: formValues.stats.specialDefense, stat: { name: 'special-defense' } },
      { base_stat: formValues.stats.speed, stat: { name: 'speed' } }
    ];

    newPokemon.abilities = formValues.abilities.map((ability: any) => ({
      ability: {
        name: ability.name
      },
      is_hidden: ability.isHidden
    }));

    try {
      this.pokemonService.addCustomPokemon(newPokemon);
      this.snackBar.open('Pokemon başarıyla eklendi!', 'Tamam', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.router.navigate(['/pokemon']);
    } catch (error) {
      this.snackBar.open('Pokemon eklenirken bir hata oluştu!', 'Tamam', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  resetForm(): void {
    this.pokemonForm.reset({
      stats: {
        hp: 60,
        attack: 60,
        defense: 60,
        specialAttack: 60,
        specialDefense: 60,
        speed: 60
      }
    });

    while (this.abilities.length) {
      this.abilities.removeAt(0);
    }
    this.abilities.push(this.createAbility());

    this.previewPokemon = null;
    this.cdr.markForCheck();
  }
}
