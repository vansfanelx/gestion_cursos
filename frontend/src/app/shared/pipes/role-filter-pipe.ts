import { Pipe, PipeTransform } from '@angular/core';

interface ItemWithRole {
  role?: string;
  [key: string]: any;
}

@Pipe({
  name: 'roleFilter',
  standalone: true
})
export class RoleFilterPipe implements PipeTransform {
  transform(items: ItemWithRole[], role: string): ItemWithRole[] {
    if (!items || !role || role === 'todos') {
      return items;
    }
    return items.filter(item => item.role === role);
  }
}
