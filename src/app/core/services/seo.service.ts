import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoRouteData } from '../models/seo.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  applyRouteSeo(seo: SeoRouteData): void {
    const canonicalUrl = this.buildCanonicalUrl();
    const type = seo.type ?? 'website';
    const robots = seo.noindex ? 'noindex,nofollow' : 'index,follow';

    this.title.setTitle(seo.title);
    this.updateNameTag('description', seo.description);
    this.updateNameTag('robots', robots);
    this.updateNameTag('twitter:card', 'summary_large_image');
    this.updateNameTag('twitter:title', seo.title);
    this.updateNameTag('twitter:description', seo.description);

    if (seo.keywords?.trim()) {
      this.updateNameTag('keywords', seo.keywords.trim());
    }

    this.updatePropertyTag('og:title', seo.title);
    this.updatePropertyTag('og:description', seo.description);
    this.updatePropertyTag('og:type', type);
    this.updatePropertyTag('og:url', canonicalUrl);
    this.updatePropertyTag('og:site_name', 'Mountaineer Debasish');

    this.setCanonicalLink(canonicalUrl);
  }

  private buildCanonicalUrl(): string {
    const { origin, pathname } = this.document.location;
    return `${origin}${pathname}`;
  }

  private setCanonicalLink(href: string): void {
    const head = this.document.head;
    let link = head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  private updateNameTag(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private updatePropertyTag(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }
}
