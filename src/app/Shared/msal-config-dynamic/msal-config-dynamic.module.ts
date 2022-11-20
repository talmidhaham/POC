import { InjectionToken, NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { IPublicClientApplication, PublicClientApplication, 
    LogLevel, 
    InteractionType} from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalBroadcastService,
     MsalInterceptorConfiguration, MsalModule, MsalService,
      MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, 
      MsalGuardConfiguration } from '@azure/msal-angular';
import { HttpBackend, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MsalConfService } from '../msal-conf-service';

const AUTH_CONFIG_URL_TOKEN = new InjectionToken<string>('AUTH_CONFIG_URL');
export const MSAL_CONFIG = new InjectionToken<any>('MSAL_CONFIG');

export function initializerFactory(env: MsalConfService, configUrl: string): any {
    const promise = env.init(configUrl).then((value) => {
        console.log('finished getting configurations dynamically.');
    });
    return () => promise;
}

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1; // Remove this line to use Angular Universal

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(config: MsalConfService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: config.getSettings('msal').auth,
    cache: config.getSettings('msal').cache,
    system: {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(config: MsalConfService): MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>(config.getSettings('interceptor').protectedResourceMap)
  
    return {
      interactionType: config.getSettings('interceptor').interactionType,
      protectedResourceMap
    };
  }
  
export function MSALGuardConfigFactory(config: MsalConfService): MsalGuardConfiguration {
    return { 
      interactionType: config.getSettings('guard').interactionType,
      authRequest: config.getSettings('guard').authRequest,
      loginFailedRoute: config.getSettings('guard').loginFailedRoute
    };
}

export function SettingsServiceFactory (http: HttpBackend, injector: Injector) 
{
  let host = injector.get(MSAL_CONFIG);
  return   new MsalConfService(http,host);
}


@NgModule({
    providers: [],
    imports: [MsalModule]
})
export class MsalConfigDynamicModule {

    static forRoot(configFile: string) {
        return {
            ngModule: MsalConfigDynamicModule,
            providers: [
              { provide :MsalConfService,deps:[MSAL_CONFIG] },
                  { provide: MsalConfService,
    useFactory: SettingsServiceFactory,
    deps: [HttpBackend,Injector]
  },
                { provide: AUTH_CONFIG_URL_TOKEN, useValue: configFile },
                // { provide: APP_INITIALIZER, useFactory: initializerFactory,
                //      deps: [MsalConfService, AUTH_CONFIG_URL_TOKEN], multi: true },
                {
                    provide: MSAL_INSTANCE,
                    useFactory: MSALInstanceFactory,
                    deps: [MsalConfService]
                },
                {
                    provide: MSAL_GUARD_CONFIG,
                    useFactory: MSALGuardConfigFactory,
                    deps: [MsalConfService]
                },
                {
                    provide: MSAL_INTERCEPTOR_CONFIG,
                    useFactory: MSALInterceptorConfigFactory,
                    deps: [MsalConfService]
                },
                MsalService,
                MsalGuard,
                MsalBroadcastService,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: MsalInterceptor,
                    multi: true
                }
            ]
        };
    }
}