import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { PokemonDetail } from '../../models/pokemon.detail';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  private customPokemonsKey = 'custom_pokemons';
  private customPokemons: PokemonDetail[] = [];
  private customPokemonsSubject = new BehaviorSubject<PokemonDetail[]>([]);

  // Önbellek için yeni değişkenler
  private pokemonCache: Map<string, PokemonDetail> = new Map();
  private pokemonListCache: Map<string, PokemonDetail[]> = new Map();

  private pokemonListChangedSubject = new BehaviorSubject<boolean>(false);
  pokemonListChanged$ = this.pokemonListChangedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCustomPokemonsFromStorage();
  }

  getPokemonList(offset: number, limit: number = 20): Observable<PokemonDetail[]> {
    const cacheKey = `list_${offset}_${limit}`;

    // Önbellekte varsa, oradan döndür
    if (this.pokemonListCache.has(cacheKey)) {
      console.log(`Pokemon listesi önbellekten alınıyor: offset=${offset}, limit=${limit}`);
      return of(this.pokemonListCache.get(cacheKey)!);
    }

    console.log(`Pokemon listesi API'den alınıyor: offset=${offset}, limit=${limit}`);
    return this.http.get<{ results: any[] }>(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`)
      .pipe(
        map(response => response.results.map(pokemon => pokemon.name)),
        switchMap(names => {
          if (names.length === 0) {
            return of([]);
          }
          return forkJoin(names.map(name => this.getPokemonDetail(name)));
        }),
        map(pokemons => {
          // Sonuçları önbelleğe kaydet
          this.pokemonListCache.set(cacheKey, pokemons);
          return pokemons;
        }),
        catchError(this.handleError)
      );
  }

  getPokemonDetail(pokemon: number | string): Observable<PokemonDetail> {
    // Özel Pokemon kontrolü
    if (typeof pokemon === 'number') {
      const customPokemon = this.customPokemons.find(p => p.id === pokemon);
      if (customPokemon) {
        console.log('Özel Pokemon bulundu, ID:', pokemon);
        return of(customPokemon);
      }
    } else if (typeof pokemon === 'string') {
      const customPokemon = this.customPokemons.find(
        p => p.name.toLowerCase() === pokemon.toLowerCase()
      );
      if (customPokemon) {
        console.log('Özel Pokemon bulundu, isim:', pokemon);
        return of(customPokemon);
      }
    }

    // Önbellek kontrolü
    const cacheKey = `pokemon_${pokemon}`;
    if (this.pokemonCache.has(cacheKey)) {
      console.log(`Pokemon önbellekten alınıyor: ${pokemon}`);
      return of(this.pokemonCache.get(cacheKey)!);
    }

    console.log(`Pokemon API'den alınıyor: ${pokemon}`);
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${pokemon}`)
      .pipe(
        map(pokemonData => {
          // API'den gelen veriyi önbelleğe kaydet
          this.pokemonCache.set(cacheKey, pokemonData);
          this.pokemonCache.set(`pokemon_${pokemonData.id}`, pokemonData);
          this.pokemonCache.set(`pokemon_${pokemonData.name.toLowerCase()}`, pokemonData);
          return pokemonData;
        }),
        catchError(error => {
          console.error('API\'den alırken hata:', error);
          if (error.status === 404) {
            return throwError(() => new Error(`Pokemon bulunamadı: ${pokemon}`));
          }
          return this.handleError(error);
        })
      );
  }

  searchPokemon(name: string): Observable<PokemonDetail> {
    // Önce özel Pokemon'larda ara
    const customPokemon = this.customPokemons.find(
      p => p.name.toLowerCase().includes(name.toLowerCase())
    );

    if (customPokemon) {
      return of(customPokemon);
    }

    // Önbellekte tam eşleşme aramak
    const cacheKey = `pokemon_${name.toLowerCase()}`;
    if (this.pokemonCache.has(cacheKey)) {
      console.log(`Pokemon önbellekten alınıyor: ${name}`);
      return of(this.pokemonCache.get(cacheKey)!);
    }

    // API'den al
    return this.http.get<PokemonDetail>(`${this.baseUrl}/pokemon/${name.toLowerCase()}`)
      .pipe(
        map(pokemonData => {
          // API'den gelen veriyi önbelleğe kaydet
          this.pokemonCache.set(cacheKey, pokemonData);
          this.pokemonCache.set(`pokemon_${pokemonData.id}`, pokemonData);
          return pokemonData;
        }),
        catchError(this.handleError)
      );
  }

  getAllPokemons(offset: number, limit: number = 20): Observable<PokemonDetail[]> {
    return this.getPokemonList(offset, limit).pipe(
      map(apiPokemons => {
        return [...apiPokemons, ...this.customPokemons];
      })
    );
  }

  // Önbelleği temizlemek için yeni metot
  clearCache(): void {
    this.pokemonCache.clear();
    this.pokemonListCache.clear();
    console.log('Pokemon önbelleği temizlendi');
  }

  // Tek bir Pokemon için önbelleği güncelleme/silme
  invalidatePokemonCache(pokemon: number | string): void {
    const cacheKey = `pokemon_${pokemon}`;
    if (this.pokemonCache.has(cacheKey)) {
      this.pokemonCache.delete(cacheKey);
      console.log(`Pokemon önbellekten silindi: ${pokemon}`);
    }
  }

  // Liste önbelleğini güncelleme/silme
  invalidateListCache(): void {
    this.pokemonListCache.clear();
    console.log('Pokemon liste önbelleği temizlendi');
  }

  loadCustomPokemonsFromStorage(): void {
    const storedPokemons = localStorage.getItem(this.customPokemonsKey);
    if (storedPokemons) {
      try {
        this.customPokemons = JSON.parse(storedPokemons);
        this.customPokemonsSubject.next(this.customPokemons);
      } catch (error) {
        console.error('Pokemon verilerini yüklerken hata:', error);
        this.customPokemons = [];
      }
    }
  }

  saveCustomPokemonsToStorage(): void {
    localStorage.setItem(this.customPokemonsKey, JSON.stringify(this.customPokemons));
    this.customPokemonsSubject.next(this.customPokemons);

    // Özel Pokemon'lar değiştiğinde listeyi de güncellememiz gerekebilir
    this.invalidateListCache();
    this.pokemonListChangedSubject.next(true);
  }

  addCustomPokemon(pokemon: PokemonDetail): Observable<PokemonDetail> {
    const exists = this.customPokemons.some(p =>
      p.name.toLowerCase() === pokemon.name.toLowerCase()
    );

    if (exists) {
      return throwError(() => new Error('Bu isimde bir Pokemon zaten mevcut!'));
    }

    this.customPokemons.push(pokemon);
    this.saveCustomPokemonsToStorage();

    // Özel Pokemon'u önbelleğe de ekle
    this.pokemonCache.set(`pokemon_${pokemon.id}`, pokemon);
    this.pokemonCache.set(`pokemon_${pokemon.name.toLowerCase()}`, pokemon);

    this.pokemonListChangedSubject.next(true);

    return of(pokemon);
  }

  updateCustomPokemon(pokemon: PokemonDetail): Observable<PokemonDetail> {
    console.log('Özel Pokemon güncelleniyor:', pokemon);
    const index = this.customPokemons.findIndex(p => p.id === pokemon.id);

    if (index !== -1) {
      this.customPokemons[index] = pokemon;
      this.saveCustomPokemonsToStorage();

      // Önbellekteki Pokemon'u da güncelle
      this.pokemonCache.set(`pokemon_${pokemon.id}`, pokemon);
      this.pokemonCache.set(`pokemon_${pokemon.name.toLowerCase()}`, pokemon);

      this.invalidateListCache(); // Liste önbelleğini temizle
      this.pokemonListChangedSubject.next(true);
      return of(pokemon);
    } else {
      console.error('Güncellenecek Pokemon bulunamadı, ID:', pokemon.id);
      return throwError(() => new Error(`Güncellenecek Pokemon bulunamadı: ID ${pokemon.id}`));
    }
  }

  deleteCustomPokemon(id: number): Observable<boolean> {
    const initialLength = this.customPokemons.length;
    const pokemonToDelete = this.customPokemons.find(p => p.id === id);

    this.customPokemons = this.customPokemons.filter(p => p.id !== id);

    if (this.customPokemons.length < initialLength) {
      this.saveCustomPokemonsToStorage();

      // Önbellekten de sil
      if (pokemonToDelete) {
        this.pokemonCache.delete(`pokemon_${id}`);
        this.pokemonCache.delete(`pokemon_${pokemonToDelete.name.toLowerCase()}`);
      }

      this.invalidateListCache(); // Liste önbelleğini temizle
      this.pokemonListChangedSubject.next(true);
      return of(true);
    } else {
      return throwError(() => new Error(`Silinecek Pokemon bulunamadı: ID ${id}`));
    }
  }

  getCustomPokemons(): Observable<PokemonDetail[]> {
    return this.customPokemonsSubject.asObservable();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Bir hata oluştu!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Hata: ${error.error.message}`;
    } else {
      errorMessage = `Hata kodu: ${error.status}, Mesaj: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
