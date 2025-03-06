import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-pokemon-search',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, CommonModule, RouterModule],
  templateUrl: './pokemon-search.component.html',
  styleUrls: ['./pokemon-search.component.css']
})
export class PokemonSearchComponent {
  @Output() search = new EventEmitter<string>();

  searchForm = new FormGroup({
    search: new FormControl('', [
      Validators.minLength(2)
    ])
  });

  constructor() {
    this.searchForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.search.emit(value || '');
      });
  }

  onSubmit() {
    if (this.searchForm.valid) {
      this.search.emit(this.searchForm.get('search')?.value ?? '');
    }
  }

  clearSearch() {
    this.searchForm.get('search')?.setValue('');
    this.search.emit('');
  }
}
