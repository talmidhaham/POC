import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus, SsoSilentRequest, RedirectRequest } from '@azure/msal-browser';
import { ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { MsalConfService } from '../Shared/msal-conf-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginDisplay = false;
  displayedColumns: string[] = ['claim', 'value'];
  dataSource: any =[];
  id:any;
  url:any;
  redirectHash:string = '';

  private readonly _destroying$ = new Subject<void>();

  constructor( private route: ActivatedRoute
    ,private router:Router,private authService: MsalService, private msalBroadcastService: MsalBroadcastService
    ,@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration
    ,private config: MsalConfService) { 

        this.id = this.route.snapshot.paramMap.get('id');
        this.route.queryParams
        .subscribe(params => {
          console.log(params); // { orderby: "price" }
          this.id = params.id;
          console.log(this.id); // price
        }
      );



    }

  ngOnInit(): void {




        this.route.params.subscribe(params =>
            {
                this.id = params.id;
                this.url = params.url;

                let activeAccount = this.authService.instance.getActiveAccount();

                if (!activeAccount && this.authService.instance.getAllAccounts().length == 0) {
                    if (this.msalGuardConfig.authRequest){
                        this.authService.loginRedirect({...this.msalGuardConfig.authRequest,extraQueryParameters:{id_token_hint: this.id },state:'*;'+this.url+'*='} as RedirectRequest);
                      } else {
                        this.authService.loginRedirect();
                      }
                }
                else {
                    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
                        let accounts = this.authService.instance.getAllAccounts();
                        this.authService.instance.setActiveAccount(accounts[0]);

                      }
                      else
                      {
                        this.redirectHash = (this.authService as any).redirectHash
                        let i =5;
                        let scopes = (this.msalGuardConfig.authRequest as any).scopes as string[] ;
                        const silentRequest: SsoSilentRequest = {
                            scopes: scopes,//["https://tlvfpdev.onmicrosoft.com/196fc7d1-dec8-44d1-a43f-adb39850d4dc/access_as_user"],
                            loginHint: "lolo",
                            extraQueryParameters: { id_token_hint: this.id },
                    
                          }

                          if (this.redirectHash.indexOf('id_token') > -1) {
                                    this.authService.ssoSilent(silentRequest)
                                    .subscribe({
                                      next: (result: AuthenticationResult) => {
                                        console.log("SsoSilent succeeded!");
                                        this.router.navigate(['/' + this.url]);
                                      }, 
                                      error: (error) => {
                                        this.authService.loginRedirect();
                                      }
                                    });
                          }
                        this.getRouteFromState();
                        
                      }
                }
            });


            this.router.events.subscribe((event) => {
                if (event instanceof NavigationStart) {
                    // Show loading indicator
                    console.log('// Show loading NavigationStart ' + event.url);
                }
    
                if (event instanceof NavigationEnd) {
                    // Hide loading indicator
                    console.log('// Show loading NavigationEnd ' + event.url);
                    let red  = this.config.navUrlFromMagicLink;
                    if (red != null || red != undefined) {
                        this.config.DelnavUrlFromMagicLink();
                        this.router.navigate([red]); 
                    }
                    
                }
    
                if (event instanceof NavigationError) {
                    // Hide loading indicator
    
                    // Present error to user
                    console.log(event.error);
                }
            });




      
  }



  getRouteFromState()
  {
        let start = this.redirectHash.indexOf('*%3b');
        let end = this.redirectHash.indexOf('*%3d');

        let wordLength = end - start;

        let redUrl = this.redirectHash.substring((start + 4),end);

        console.log('/'+redUrl);
        //this.router.navigate(['/'+redUrl]);
        this.config.SetnavUrlFromMagicLink('/'+redUrl);
  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  getClaims(claims: any) {
    this.dataSource = [
      {id: 1, claim: "Display Name", value: claims ? claims['name'] : null},
      {id: 2, claim: "Object ID", value: claims ? claims['sub']: null},
      {id: 3, claim: "Job Title", value: claims ? claims['jobTitle']: null},
      {id: 4, claim: "City", value: claims ? claims['city']: null},
    ];
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}