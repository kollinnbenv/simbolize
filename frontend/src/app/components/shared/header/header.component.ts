import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  menuOpen = false;
  showHamburger = false;

  @ViewChild('headerRoot') headerRoot?: ElementRef<HTMLElement>;
  @ViewChild('logoArea') logoArea?: ElementRef<HTMLElement>;
  @ViewChild('desktopNav') desktopNav?: ElementRef<HTMLElement>;
  @ViewChild('menuButton') menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('menuPanel') menuPanel?: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.updateMenuMode();

    if (typeof ResizeObserver !== 'undefined' && this.headerRoot?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.updateMenuMode());
      this.resizeObserver.observe(this.headerRoot.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const clickedButton = this.menuButton?.nativeElement.contains(target) ?? false;
    const clickedPanel = this.menuPanel?.nativeElement.contains(target) ?? false;

    if (!clickedButton && !clickedPanel) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      this.menuButton?.nativeElement.focus();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateMenuMode();
  }

  private updateMenuMode(): void {
    const header = this.headerRoot?.nativeElement;
    const logo = this.logoArea?.nativeElement;
    const nav = this.desktopNav?.nativeElement;

    if (!header || !logo || !nav) {
      return;
    }

    const headerWidth = header.clientWidth;
    const logoWidth = logo.getBoundingClientRect().width;
    const navWidth = nav.getBoundingClientRect().width;
    const padding = 32;
    const available = headerWidth - logoWidth - padding;

    const shouldShowHamburger = navWidth > available;
    if (this.showHamburger !== shouldShowHamburger) {
      this.showHamburger = shouldShowHamburger;
      if (!this.showHamburger) {
        this.menuOpen = false;
      }
    }
  }
}
