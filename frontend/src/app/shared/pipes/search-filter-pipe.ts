import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fields: string[]): any[] {
    if (!items || !searchText || searchText.trim() === '') {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      return fields.some(field => {
        const value = this.getNestedProperty(item, field);
        return value && value.toString().toLowerCase().includes(searchText);
      });
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }
}
