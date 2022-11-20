import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { MSAL_CONFIG } from './app/Shared/msal-config-dynamic/msal-config-dynamic.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}



fetch('assets/Config/MsalConfig.json')
  .then((res) => res.json())
  .then((MsalConfig) => {
    if (environment.production) {
      enableProdMode();
    }

    let msal = MsalConfig;

platformBrowserDynamic([{ provide: MSAL_CONFIG, useValue: msal }]).bootstrapModule(AppModule)
  .catch(err => console.error(err));

  });
