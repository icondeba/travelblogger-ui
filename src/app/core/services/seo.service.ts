import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoRouteData } from '../models/seo.model';

const DEFAULT_IMAGE = 'https://www.mountaineerdebasish.com/og-image.jpg';

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
    const image = seo.image?.trim() || DEFAULT_IMAGE;

    this.title.setTitle(seo.title);
    this.updateNameTag('description', seo.description);
    this.updateNameTag('robots', robots);
    this.updateNameTag('twitter:card', 'summary_large_image');
    this.updateNameTag('twitter:title', seo.title);
    this.updateNameTag('twitter:description', seo.description);
    this.updateNameTag('twitter:image', image);

    if (seo.keywords?.trim()) {
      this.updateNameTag('keywords', seo.keywords.trim());
    }

    this.updatePropertyTag('og:title', seo.title);
    this.updatePropertyTag('og:description', seo.description);
    this.updatePropertyTag('og:type', type);
    this.updatePropertyTag('og:url', canonicalUrl);
    this.updatePropertyTag('og:site_name', 'Mountaineer Debasish');
    this.updatePropertyTag('og:image', image);
    this.updatePropertyTag('og:image:width', '1200');
    this.updatePropertyTag('og:image:height', '630');

    this.setCanonicalLink(canonicalUrl);
    this.setJsonLd(seo, canonicalUrl, image);
  }

  private setJsonLd(seo: SeoRouteData, url: string, image: string): void {
    const head = this.document.head;
    let script = head.querySelector('script[data-seo="json-ld"]') as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo', 'json-ld');
      head.appendChild(script);
    }

    const isArticle = seo.type === 'article';
    const schema = isArticle
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: seo.title,
          description: seo.description,
          image,
          url,
          author: {
            '@type': 'Person',
            name: 'Debasish',
            url: 'https://www.mountaineerdebasish.com/about'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Mountaineer Debasish',
            url: 'https://www.mountaineerdebasish.com'
          }
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: seo.title,
          description: seo.description,
          url,
          image
        };

    script.textContent = JSON.stringify(schema);
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
