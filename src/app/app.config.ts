import { ApplicationConfig, ENVIRONMENT_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IconsService } from './icons.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    // {
    //   provide: ENVIRONMENT_INITIALIZER,
    //   useValue: () => inject(IconsService),
    //   multi: true,
    // },
  ]
};
