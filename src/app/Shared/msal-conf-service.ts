import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { MSAL_CONFIG } from './msal-config-dynamic/msal-config-dynamic.module';

@Injectable({
  providedIn: 'root'
})
export class MsalConfService {

  private settings: any;
  private http: HttpClient;
  public navUrlFromMagicLink:any;

  constructor(private readonly httpHandler: HttpBackend,  @Inject(MSAL_CONFIG) msal?: any) {
    this.http = new HttpClient(httpHandler);
    this.settings = msal;
  }

  init(endpoint: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http.get(endpoint).pipe(map(result => result))
        .subscribe(value => {
          console.log('settings: '+ value);
          //this.settings = value;
          resolve(true);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getSettings(key?: string | Array<string>): any {
    if (!key || (Array.isArray(key) && !key[0])) {
      return this.settings;
    }

    if (!Array.isArray(key)) {
      key = key.split('.');
    }

    let result = key.reduce((account: any, current: string) => account && account[current], this.settings);

    return result;
  }


  DelnavUrlFromMagicLink()
  {
    this.navUrlFromMagicLink = null;
  }


  SetnavUrlFromMagicLink(url:any)
  {
    this.navUrlFromMagicLink = url;
  }
}
