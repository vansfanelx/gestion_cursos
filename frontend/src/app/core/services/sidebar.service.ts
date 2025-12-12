import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private expandedSubject = new BehaviorSubject<boolean>(true);
  private mobileOpenSubject = new BehaviorSubject<boolean>(false);

  isExpanded$ = this.expandedSubject.asObservable();
  isMobileOpen$ = this.mobileOpenSubject.asObservable();

  toggleExpanded(): void {
    this.expandedSubject.next(!this.expandedSubject.value);
  }

  toggleMobileOpen(): void {
    this.mobileOpenSubject.next(!this.mobileOpenSubject.value);
  }

  closeMobile(): void {
    this.mobileOpenSubject.next(false);
  }

  setExpanded(value: boolean): void {
    this.expandedSubject.next(value);
  }

  setMobileOpen(value: boolean): void {
    this.mobileOpenSubject.next(value);
  }

  get isExpanded(): boolean {
    return this.expandedSubject.value;
  }

  get isMobileOpen(): boolean {
    return this.mobileOpenSubject.value;
  }
}
