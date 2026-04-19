import { Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NavbarComponent],
  template: '<app-navbar />'
})
export class HeaderComponent {}
