import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconsService {
  /**
   * Constructor
   */
  constructor() {
    const domSanitizer = inject(DomSanitizer);
    const matIconRegistry = inject(MatIconRegistry);

    // Register icon sets
    matIconRegistry.addSvgIconSetInNamespace('heroicons_outline', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-outline.svg'));
    matIconRegistry.addSvgIconSetInNamespace('heroicons_solid', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-solid.svg'));
    matIconRegistry.addSvgIconSetInNamespace('heroicons_mini', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/heroicons-mini.svg'));
  }
}
