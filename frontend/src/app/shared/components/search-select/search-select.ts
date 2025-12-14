import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-select.html',
  styleUrl: './search-select.css'
})
export class SearchSelect implements OnInit, OnChanges {
  @Input() options: any[] = [];
  @Input() labelKey = 'name';
  @Input() valueKey = 'id';
  @Input() placeholder = 'Buscar...';
  @Input() selectedValue: any = null;
  @Input() disabled = false;
  @Output() selectedChange = new EventEmitter<any>();

  query = '';
  isOpen = false;
  highlightedIndex = -1;

  ngOnInit(): void {
    this.syncHighlighted();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedValue'] && !changes['selectedValue'].firstChange) {
      this.syncSelectedQuery();
      this.syncHighlighted();
    }
    if (changes['options'] && !changes['options'].firstChange) {
      this.syncSelectedQuery();
      this.syncHighlighted();
    }
  }

  get filteredOptions() {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(opt => (opt[this.labelKey] || '').toLowerCase().includes(q));
  }

  toggleOpen(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.syncHighlighted();
  }

  open(): void {
    if (this.disabled) return;
    this.isOpen = true;
    this.syncHighlighted();
  }

  close(): void {
    if (this.disabled) return;
    this.isOpen = false;
  }

  onInput(e: any): void {
    if (this.disabled) return;
    this.query = e.target.value;
    this.highlightedIndex = this.filteredOptions.length ? 0 : -1;
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    if (!this.isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        this.open();
        event.preventDefault();
      }
      return;
    }
    const max = this.filteredOptions.length - 1;
    if (event.key === 'ArrowDown') {
      this.highlightedIndex = Math.min(max, this.highlightedIndex + 1);
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
      event.preventDefault();
    } else if (event.key === 'Enter') {
      if (this.highlightedIndex >= 0) {
        const opt = this.filteredOptions[this.highlightedIndex];
        this.select(opt);
        event.preventDefault();
      }
    } else if (event.key === 'Escape') {
      this.close();
      event.preventDefault();
    }
  }

  select(opt: any): void {
    if (this.disabled) return;
    this.selectedValue = opt[this.valueKey];
    this.selectedChange.emit(this.selectedValue);
    this.query = opt[this.labelKey] || '';
    this.close();
  }

  isSelected(opt: any): boolean {
    return this.selectedValue === opt[this.valueKey];
  }

  syncHighlighted(): void {
    // Try to set highlighted to current selection if visible
    const idx = this.filteredOptions.findIndex(o => o[this.valueKey] === this.selectedValue);
    this.highlightedIndex = idx >= 0 ? idx : (this.filteredOptions.length ? 0 : -1);
  }

  private syncSelectedQuery(): void {
    const current = this.options.find(o => o[this.valueKey] === this.selectedValue);
    if (current) {
      this.query = current[this.labelKey] || '';
    }
  }

  highlightText(text: string): {__html: string} {
    const q = this.query.trim();
    if (!q) return { __html: text } as any;
    const escQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escQ, 'ig');
    const html = text.replace(re, (m) => `<mark>${m}</mark>`);
    return { __html: html } as any;
  }
}
