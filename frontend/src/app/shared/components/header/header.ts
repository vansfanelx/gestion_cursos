import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  isMobileOpen$;
  isExpanded$;

  constructor(
    public sidebarService: SidebarService,
    private authService: Auth
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
    this.isExpanded$ = this.sidebarService.isExpanded$;
  }

  handleToggle(): void {
    if (window.innerWidth >= 1024) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  get currentUser() {
    return this.authService.currentUserValue;
  }

  get userRole(): string {
    return this.authService.getUserRole();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
