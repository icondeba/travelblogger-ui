import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header.component';
import { FooterComponent } from './core/footer.component';
import { filter, startWith } from 'rxjs';
import { SeoService } from './core/services/seo.service';
import { SeoRouteData } from './core/models/seo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => {
        const seoData = this.getSeoData(this.activatedRoute);
        if (seoData) {
          this.seoService.applyRouteSeo(seoData);
        }
      });
  }

  private getSeoData(route: ActivatedRoute): SeoRouteData | null {
    let currentRoute: ActivatedRoute | null = route;
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return (currentRoute?.snapshot.data?.['seo'] as SeoRouteData | undefined) ?? null;
  }
}
