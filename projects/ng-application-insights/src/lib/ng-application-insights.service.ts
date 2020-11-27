import { Injectable } from '@angular/core';
import {
  ApplicationInsights,
  IEventTelemetry,
  IExceptionTelemetry,
} from '@microsoft/applicationinsights-web';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface ICustomProperties {
  [key: string]: any;
}

@Injectable()
export class NgApplicationInsightsConfig {
  enabled = true;
  instrumentationKey = '';
  whiteLabel = false;
}

@Injectable({
  providedIn: 'root',
})
export class NgApplicationInsightsService {
  appInsights: ApplicationInsights;
  private customProperties: ICustomProperties = {};

  constructor(
    private config: NgApplicationInsightsConfig,
    private router: Router
  ) {
    if (this.config.enabled) {
      this.appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: this.config.instrumentationKey,
          enableAutoRouteTracking: true,
        },
      });

      this.appInsights.loadAppInsights();
      this.createRouterSubscription();
    }
  }

  trackPageView(name?: string, uri?: string): void {
    if (this.config.enabled) {
      this.appInsights.trackPageView({
        name,
        uri,
        properties: this.customProperties,
      });
    }
  }

  trackEvent(
    event: IEventTelemetry,
    customProperties?: { [key: string]: any }
  ): void {
    if (this.config.enabled) {
      customProperties = {
        ...customProperties,
        ...this.customProperties,
      }
      this.appInsights.trackEvent(event, customProperties);
    }
  }

  trackException(error: Error): void {
    const exception: IExceptionTelemetry = {
      exception: error,
      properties: this.customProperties,
    };
    if (this.config.enabled) {
      this.appInsights.trackException(exception);
    }
  }

  setCustomProperty(property: string, value: any): void {
    this.customProperties[property] = value;
  }

  private createRouterSubscription(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(null, event.urlAfterRedirects);
      });
  }
}
