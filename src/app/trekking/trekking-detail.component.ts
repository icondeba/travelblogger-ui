import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, map, of, startWith, switchMap, tap } from 'rxjs';
import { TrekkingInfoService } from '../core/services/trekking-info.service';
import { TrekkingInfo } from '../core/models/trekking-info.model';
import { LoadState } from '../core/models/load-state.model';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-trekking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trekking-detail.component.html',
  styleUrl: './trekking-detail.component.scss'
})
export class TrekkingDetailComponent {
  private route = inject(ActivatedRoute);
  private trekkingService = inject(TrekkingInfoService);
  private seoService = inject(SeoService);
  private sanitizer = inject(DomSanitizer);

  trekState$ = this.route.paramMap.pipe(
    switchMap((params) => this.trekkingService.getItem(params.get('slug') ?? '')),
    tap((trek) => {
      this.seoService.applyRouteSeo({
        title: `${trek.title} | Trekking Details | Mountaineer Debasish`,
        description: this.toDescription(trek.summary, trek.details),
        type: 'article',
        image: trek.image || undefined
      });
    }),
    map((data) => ({ status: 'success', data } as LoadState<TrekkingInfo>)),
    startWith({ status: 'loading' } as LoadState<TrekkingInfo>),
    catchError(() => of({ status: 'error', error: 'Unable to load trekking information.' } as LoadState<TrekkingInfo>))
  );

  safeMapUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private toDescription(summary: string, details: string): string {
    const source = summary?.trim() || details?.trim() || 'Trekking route and map details.';
    const normalized = source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
  }
}
