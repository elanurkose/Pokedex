import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statName',
  standalone: true,
})
export class StatNamePipe implements PipeTransform {
  transform(value: string): string {
    return value
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
